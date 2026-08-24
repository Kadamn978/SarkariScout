import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterDto, LoginDto } from './auth.dto';

const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password, { memoryCost: 65536, timeCost: 3 });
    const user = await this.prisma.user.create({
      data: { email: dto.email.toLowerCase().trim(), passwordHash, name: dto.name.trim() },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const lockKey = `lock:${dto.email.toLowerCase()}`;
    const attempts = await this.redis.get(lockKey);

    if (attempts && parseInt(attempts) >= 5) {
      throw new UnauthorizedException('Account locked. Try again in 15 minutes.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });

    // Timing-safe: always run argon2.verify to prevent email enumeration
    const passwordToVerify = dto.password;
    const hashToVerify = user?.passwordHash || DUMMY_HASH;
    const valid = await argon2.verify(hashToVerify, passwordToVerify);

    if (!user || !valid) {
      await this.handleFailedLogin(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.redis.del(lockKey);
    return this.generateTokens(user.id, user.email, user.role);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken);

      const stored = await this.redis.get(`refresh:${payload.sub}`);
      if (!stored || !this.timingSafeCompare(stored, refreshToken)) {
        // Potential token reuse — invalidate all tokens for this user
        if (stored && !this.timingSafeCompare(stored, refreshToken)) {
          await this.redis.del(`refresh:${payload.sub}`);
        }
        throw new ForbiddenException('Invalid refresh token');
      }

      // Token rotation: delete old refresh token before issuing new pair
      await this.redis.del(`refresh:${payload.sub}`);
      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
  }

  private async handleFailedLogin(email: string) {
    const lockKey = `lock:${email.toLowerCase()}`;
    const attempts = await this.redis.incr(lockKey);
    if (attempts === 1) {
      await this.redis.expire(lockKey, 900);
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, role, type: 'access' },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwt.sign(
      { sub: userId, email, role, type: 'refresh' },
      { expiresIn: '7d' },
    );

    await this.redis.set(`refresh:${userId}`, refreshToken, 604800);

    return { accessToken, refreshToken, user: { id: userId, email, role } };
  }

  private timingSafeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return timingSafeEqual(bufA, bufB);
  }

  async verifyToken(token: string) {
    return this.jwt.verifyAsync(token);
  }
}
