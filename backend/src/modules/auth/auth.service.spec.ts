import { Test, TestingModule } from '@nestjs/testing'
import {
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  GoneException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { EmailService } from '../email/email.service'
import * as argon2 from 'argon2'

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}

const mockJwt = {
  sign: jest.fn(),
  verifyAsync: jest.fn(),
}

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
}

const mockEmail = {
  sendEmail: jest.fn().mockResolvedValue(undefined),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: RedisService, useValue: mockRedis },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should create a user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER' })
      mockJwt.sign.mockReturnValue('token')
      mockRedis.set.mockResolvedValue(undefined)

      const result = await service.register({
        email: 'test@test.com',
        password: 'Test@1234!',
        name: 'Test',
      })

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } })
      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(result.accessToken).toBe('token')
      expect(result.user.email).toBe('test@test.com')
    })

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' })

      await expect(
        service.register({ email: 'test@test.com', password: 'Test@1234!', name: 'Test' }),
      ).rejects.toThrow(ConflictException)
    })

    it('should lowercase and trim email on create', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER' })
      mockJwt.sign.mockReturnValue('token')
      mockRedis.set.mockResolvedValue(undefined)

      await service.register({ email: '  TEST@Test.COM  ', password: 'Test@1234!', name: 'Test' })

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: 'test@test.com' }) }),
      )
    })

    it('should hash password with argon2', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER' })
      mockJwt.sign.mockReturnValue('token')
      mockRedis.set.mockResolvedValue(undefined)

      await service.register({ email: 'test@test.com', password: 'Test@1234!', name: 'Test' })

      const createCall = mockPrisma.user.create.mock.calls[0][0]
      const hash = createCall.data.passwordHash
      expect(hash).not.toBe('Test@1234!')
      const valid = await argon2.verify(hash, 'Test@1234!')
      expect(valid).toBe(true)
    })
  })

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const hash = await argon2.hash('Test@1234!')
      mockRedis.get.mockResolvedValue(null)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'USER',
        passwordHash: hash,
        emailVerifiedAt: new Date(),
      })
      mockJwt.sign.mockReturnValue('token')
      mockRedis.set.mockResolvedValue(undefined)

      const result = await service.login({ email: 'test@test.com', password: 'Test@1234!' })

      expect(result.accessToken).toBe('token')
    })

    it('should throw UnauthorizedException on bad email (timing-safe)', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(undefined)

      const start = Date.now()
      await expect(
        service.login({ email: 'wrong@test.com', password: 'Test@1234!' }),
      ).rejects.toThrow(UnauthorizedException)
      const elapsed = Date.now() - start

      // Should still run argon2.verify on dummy hash (takes ~100ms+)
      expect(elapsed).toBeGreaterThan(50)
      expect(mockRedis.incr).toHaveBeenCalled()
    })

    it('should throw UnauthorizedException on bad password', async () => {
      const hash = await argon2.hash('CorrectPass@1!')
      mockRedis.get.mockResolvedValue(null)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'USER',
        passwordHash: hash,
      })
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(undefined)

      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPass@1!' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when account is locked', async () => {
      mockRedis.get.mockResolvedValue('5')

      await expect(
        service.login({ email: 'test@test.com', password: 'Test@1234!' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should increment failed login counter', async () => {
      const hash = await argon2.hash('CorrectPass@1!')
      mockRedis.get.mockResolvedValue(null)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'USER',
        passwordHash: hash,
      })
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(undefined)

      await service.login({ email: 'test@test.com', password: 'WrongPass@1!' }).catch(() => {})

      expect(mockRedis.incr).toHaveBeenCalledWith('lock:test@test.com')
      expect(mockRedis.expire).toHaveBeenCalledWith('lock:test@test.com', 900)
    })

    it('should have similar response time for bad email vs bad password', async () => {
      const hash = await argon2.hash('CorrectPass@1!')
      mockRedis.get.mockResolvedValue(null)
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(undefined)

      // Bad email path
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const start1 = Date.now()
      await service.login({ email: 'bad@test.com', password: 'WrongPass@1!' }).catch(() => {})
      const time1 = Date.now() - start1

      // Bad password path
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'USER',
        passwordHash: hash,
      })
      const start2 = Date.now()
      await service.login({ email: 'test@test.com', password: 'WrongPass@1!' }).catch(() => {})
      const time2 = Date.now() - start2

      // Both should take roughly the same time (argon2.verify on both)
      // Allow generous tolerance since argon2 timing varies
      const diff = Math.abs(time1 - time2)
      expect(diff).toBeLessThan(300) // within 300ms of each other
    })
  })

  describe('refreshTokens', () => {
    it('should return new tokens pair with rotation', async () => {
      mockJwt.verifyAsync.mockResolvedValue({
        sub: '1',
        email: 'test@test.com',
        role: 'USER',
        type: 'refresh',
      })
      mockRedis.get.mockResolvedValue('valid-refresh-token')
      mockRedis.del.mockResolvedValue(undefined)
      mockJwt.sign.mockReturnValue('new-token')
      mockRedis.set.mockResolvedValue(undefined)

      const result = await service.refreshTokens('valid-refresh-token')

      expect(result.accessToken).toBe('new-token')
      // Token rotation: old token overwritten with new one
      expect(mockRedis.set).toHaveBeenCalledWith('refresh:1', 'new-token', 604800)
    })

    it('should throw ForbiddenException if token not in Redis', async () => {
      mockJwt.verifyAsync.mockResolvedValue({
        sub: '1',
        email: 'test@test.com',
        role: 'USER',
        type: 'refresh',
      })
      mockRedis.get.mockResolvedValue(null)

      await expect(service.refreshTokens('stale-token')).rejects.toThrow(ForbiddenException)
    })

    it('should throw UnauthorizedException on invalid token', async () => {
      mockJwt.verifyAsync.mockRejectedValue(new Error('jwt expired'))

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should invalidate all tokens on token reuse attempt', async () => {
      mockJwt.verifyAsync.mockResolvedValue({
        sub: '1',
        email: 'test@test.com',
        role: 'USER',
        type: 'refresh',
      })
      // Stored token is different from presented token (reuse attempt)
      mockRedis.get.mockResolvedValue('new-legitimate-token')
      mockRedis.del.mockResolvedValue(undefined)

      await expect(service.refreshTokens('old-stolen-token')).rejects.toThrow(ForbiddenException)
      // Should delete the stored token (invalidate session)
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:1')
    })
  })

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      mockRedis.del.mockResolvedValue(undefined)

      await service.logout('user-1')

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1')
    })
  })

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      mockRedis.get.mockResolvedValue('user-1')
      mockPrisma.user.update.mockResolvedValue({})
      mockRedis.del.mockResolvedValue(undefined)

      const result = await service.verifyEmail('valid-token')

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { emailVerifiedAt: expect.any(Date) },
      })
      expect(mockRedis.del).toHaveBeenCalledWith('verify:valid-token')
      expect(result.message).toBe('Email verified successfully')
    })

    it('should throw GoneException for invalid token', async () => {
      mockRedis.get.mockResolvedValue(null)

      await expect(service.verifyEmail('bad-token')).rejects.toThrow(GoneException)
    })
  })

  describe('forgotPassword', () => {
    it('should always return same message regardless of email existence', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await service.forgotPassword('nobody@test.com')
      expect(result.message).toBe('If email exists, reset link sent')
      expect(mockEmail.sendEmail).not.toHaveBeenCalled()
    })

    it('should send reset email when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com' })
      mockRedis.set.mockResolvedValue(undefined)
      mockEmail.sendEmail.mockResolvedValue(undefined)

      const result = await service.forgotPassword('test@test.com')
      expect(result.message).toBe('If email exists, reset link sent')
      expect(mockRedis.set).toHaveBeenCalledWith(expect.stringMatching(/^reset:/), 'user-1', 900)
      expect(mockEmail.sendEmail).toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      mockRedis.get.mockResolvedValue('user-1')
      mockPrisma.user.update.mockResolvedValue({})
      mockRedis.del.mockResolvedValue(undefined)

      const result = await service.resetPassword('valid-token', 'NewPass@123')

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: expect.any(String) },
      })
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1')
      expect(mockRedis.del).toHaveBeenCalledWith('reset:valid-token')
      expect(result.message).toBe('Password reset successful')
    })

    it('should throw GoneException for invalid/expired token', async () => {
      mockRedis.get.mockResolvedValue(null)

      await expect(service.resetPassword('bad-token', 'NewPass@123')).rejects.toThrow(GoneException)
    })

    it('should invalidate all sessions after password reset', async () => {
      mockRedis.get.mockResolvedValue('user-1')
      mockPrisma.user.update.mockResolvedValue({})
      mockRedis.del.mockResolvedValue(undefined)

      await service.resetPassword('valid-token', 'NewPass@123')

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1')
    })
  })
})
