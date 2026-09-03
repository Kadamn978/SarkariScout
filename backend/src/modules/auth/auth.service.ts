import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  GoneException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { timingSafeEqual, randomUUID } from 'crypto'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { EmailService } from '../email/email.service'
import { RegisterDto, LoginDto } from './auth.dto'
import { PasswordStrengthService } from '../../common/validation/password-strength'
import { DISPOSABLE_EMAIL_DOMAINS } from '../../common/validation/disposable-emails'

const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const FRONTEND_URL = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly passwordStrengthService: PasswordStrengthService
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
    private emailService: EmailService,
  ) {
    this.passwordStrengthService = new PasswordStrengthService()
  }

  async register(dto: RegisterDto) {
    const emailDomain = dto.email.toLowerCase().trim().split('@')[1]
    if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      throw new ConflictException('Disposable email addresses are not allowed')
    }

    await this.passwordStrengthService.validatePassword(dto.password)

    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email already registered')

    const passwordHash = await argon2.hash(dto.password, { memoryCost: 65536, timeCost: 3 })
    const user = await this.prisma.user.create({
      data: { email: dto.email.toLowerCase().trim(), passwordHash, name: dto.name.trim() },
    })

    // Send verification email (non-blocking)
    this.sendVerificationEmail(user.id, user.email).catch((err) => {
      this.logger.warn(`Failed to send verification email to ${user.email}: ${err.message}`)
    })

    // Return tokens but frontend must check emailVerifiedAt
    return this.generateTokens(user.id, user.email, user.role, user.emailVerifiedAt)
  }

  async login(dto: LoginDto) {
    const identifier = dto.email.toLowerCase().trim()
    const lockKey = `lock:${identifier}`
    const attempts = await this.redis.get(lockKey)

    if (attempts && parseInt(attempts) >= 5) {
      throw new UnauthorizedException('Account locked. Try again in 15 minutes.')
    }

    const user = await this.prisma.user.findUnique({
      where: { email: identifier },
    })

    // Timing-safe: always run argon2.verify to prevent email enumeration
    const passwordToVerify = dto.password
    const hashToVerify = user?.passwordHash || DUMMY_HASH
    const valid = await argon2.verify(hashToVerify, passwordToVerify)

    if (!user || !valid) {
      await this.handleFailedLogin(identifier)
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.redis.del(lockKey)

    // Check email verification
    if (!user.emailVerifiedAt) {
      // Resend verification email automatically
      this.sendVerificationEmail(user.id, user.email).catch((err) => {
        this.logger.warn(`Failed to resend verification to ${user.email}: ${err.message}`)
      })
      throw new UnauthorizedException(
        'Please verify your email before logging in. A new verification link has been sent.',
      )
    }

    return this.generateTokens(user.id, user.email, user.role, user.emailVerifiedAt)
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken)

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type')
      }

      const stored = await this.redis.get(`refresh:${payload.sub}`)
      if (!stored || !this.timingSafeCompare(stored, refreshToken)) {
        // Potential token reuse — invalidate all tokens for this user
        if (stored) {
          await this.redis.del(`refresh:${payload.sub}`)
        }
        throw new ForbiddenException('Invalid refresh token')
      }

      // Token rotation: delete old token FIRST to prevent race condition
      // If attacker replays the token, it's already deleted
      await this.redis.del(`refresh:${payload.sub}`)

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { emailVerifiedAt: true } })
      const newTokens = await this.generateTokens(payload.sub, payload.email, payload.role, user?.emailVerifiedAt)
      return newTokens
    } catch (err) {
      if (err instanceof ForbiddenException) throw err
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`)
  }

  // --- Email Verification ---

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  }

  async sendVerificationEmail(userId: string, email: string) {
    const token = randomUUID()
    await this.redis.set(`verify:${token}`, userId, 86400) // 24 hours

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`
    await this.emailService.sendEmail({
      to: email,
      subject: 'RozgarScout - Verify your email',
      html: `
        <h2>Welcome to RozgarScout!</h2>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't register, ignore this email.</p>
      `,
    })
  }

  async verifyEmail(token: string) {
    const userId = await this.redis.get(`verify:${token}`)
    if (!userId) throw new GoneException('Invalid or expired verification token')

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (user?.emailVerifiedAt) {
      await this.redis.del(`verify:${token}`)
      return { message: 'Email already verified. You can log in.' }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    })

    await this.redis.del(`verify:${token}`)

    this.emailService.sendWelcomeEmail(userId).catch((err) => {
      this.logger.warn(`Failed to send welcome email to ${user?.email}: ${err.message}`)
    })

    return { message: 'Email verified successfully' }
  }

  // --- Password Reset ---

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always return same message to prevent email enumeration
    if (!user) return { message: 'If email exists, reset link sent' }

    const token = randomUUID()
    await this.redis.set(`reset:${token}`, user.id, 900) // 15 minutes

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'RozgarScout - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px">Reset Password</a></p>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    })

    return { message: 'If email exists, reset link sent' }
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.get(`reset:${token}`)
    if (!userId) throw new GoneException('Invalid or expired reset token')

    const passwordHash = await argon2.hash(newPassword, { memoryCost: 65536, timeCost: 3 })
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    // Invalidate all refresh tokens for this user
    await this.redis.del(`refresh:${userId}`)
    await this.redis.del(`reset:${token}`)

    return { message: 'Password reset successful' }
  }

  private async handleFailedLogin(email: string) {
    const lockKey = `lock:${email.toLowerCase()}`
    const failKey = `exp_fail:${email.toLowerCase()}`
    const attempts = await this.redis.incr(lockKey)
    const failCount = await this.redis.incr(failKey)

    if (attempts === 1) {
      await this.redis.expire(lockKey, 900)
    }
    if (failCount === 1) {
      await this.redis.expire(failKey, 86400)
    }

    // Exponential backoff thresholds
    const lockoutThresholds = [
      { failures: 5, lockoutMinutes: 15 },
      { failures: 10, lockoutMinutes: 60 },
      { failures: 15, lockoutMinutes: 1440 },
    ]

    for (let i = lockoutThresholds.length - 1; i >= 0; i--) {
      if (failCount >= lockoutThresholds[i].failures) {
        const lockoutMinutes = lockoutThresholds[i].lockoutMinutes
        await this.redis.set(lockKey, failCount.toString(), lockoutMinutes * 60)
        break
      }
    }
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string
    email: string
    name: string
    avatar?: string
  }) {
    // First try to find by googleId (returning user via Google)
    let user = await this.prisma.user.findUnique({ where: { googleId: profile.googleId } })

    if (user) {
      return { id: user.id, email: user.email, role: user.role, name: user.name }
    }

    // Try to find by email (user registered with password, now linking Google)
    user = await this.prisma.user.findUnique({ where: { email: profile.email } })

    if (user) {
      // Link Google account to existing user
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          avatar: profile.avatar || user.avatar,
          emailVerifiedAt: user.emailVerifiedAt || new Date(),
        },
      })
      return { id: user.id, email: user.email, role: user.role, name: user.name }
    }

    // Create new user via Google
    const dummyHash = await argon2.hash(randomUUID(), { memoryCost: 65536, timeCost: 3 })
    user = await this.prisma.user.create({
      data: {
        email: profile.email.toLowerCase(),
        passwordHash: dummyHash,
        name: profile.name,
        avatar: profile.avatar,
        googleId: profile.googleId,
        emailVerifiedAt: new Date(),
      },
    })

    return { id: user.id, email: user.email, role: user.role, name: user.name }
  }

  async generateTokens(userId: string, email: string, role: string, emailVerifiedAt?: Date | null) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, role, type: 'access' },
      { expiresIn: '15m' },
    )
    const refreshToken = this.jwt.sign(
      { sub: userId, email, role, type: 'refresh' },
      { expiresIn: '7d' },
    )

    await this.redis.set(`refresh:${userId}`, refreshToken, 604800)

    return { accessToken, refreshToken, user: { id: userId, email, role }, emailVerifiedAt: emailVerifiedAt || null }
  }

  private timingSafeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) {
      const maxLen = Math.max(bufA.length, bufB.length)
      const paddedA = Buffer.alloc(maxLen, 0)
      const paddedB = Buffer.alloc(maxLen, 0)
      bufA.copy(paddedA)
      bufB.copy(paddedB)
      timingSafeEqual(paddedA, paddedB)
      return false
    }
    return timingSafeEqual(bufA, bufB)
  }

  async verifyToken(token: string) {
    return this.jwt.verifyAsync(token)
  }
}
