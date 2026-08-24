import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import * as argon2 from 'argon2';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER' });
      mockJwt.sign.mockReturnValue('token');
      mockRedis.set.mockResolvedValue(undefined);

      const result = await service.register({ email: 'test@test.com', password: 'Test@1234', name: 'Test' });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({ email: 'test@test.com', password: 'Test@1234', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should lowercase and trim email on create', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER' });
      mockJwt.sign.mockReturnValue('token');
      mockRedis.set.mockResolvedValue(undefined);

      await service.register({ email: '  TEST@Test.COM  ', password: 'Test@1234', name: 'Test' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: 'test@test.com' }) }),
      );
    });

    it('should hash password with argon2', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER' });
      mockJwt.sign.mockReturnValue('token');
      mockRedis.set.mockResolvedValue(undefined);

      await service.register({ email: 'test@test.com', password: 'Test@1234', name: 'Test' });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      const hash = createCall.data.passwordHash;
      expect(hash).not.toBe('Test@1234');
      const valid = await argon2.verify(hash, 'Test@1234');
      expect(valid).toBe(true);
    });
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const hash = await argon2.hash('Test@1234');
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER', passwordHash: hash });
      mockJwt.sign.mockReturnValue('token');
      mockRedis.set.mockResolvedValue(undefined);
      mockRedis.del.mockResolvedValue(undefined);

      const result = await service.login({ email: 'test@test.com', password: 'Test@1234' });

      expect(result.accessToken).toBe('token');
      expect(mockRedis.del).toHaveBeenCalledWith('lock:test@test.com');
    });

    it('should throw UnauthorizedException on bad email', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'Test@1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on bad password', async () => {
      const hash = await argon2.hash('CorrectPass@1');
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER', passwordHash: hash });
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPass@1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account is locked', async () => {
      mockRedis.get.mockResolvedValue('5');

      await expect(
        service.login({ email: 'test@test.com', password: 'Test@1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should increment failed login counter', async () => {
      const hash = await argon2.hash('CorrectPass@1');
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'USER', passwordHash: hash });
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      await service.login({ email: 'test@test.com', password: 'WrongPass@1' }).catch(() => {});

      expect(mockRedis.incr).toHaveBeenCalledWith('lock:test@test.com');
      expect(mockRedis.expire).toHaveBeenCalledWith('lock:test@test.com', 900);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens pair', async () => {
      mockJwt.verifyAsync.mockResolvedValue({ sub: '1', email: 'test@test.com', role: 'USER', type: 'refresh' });
      mockRedis.get.mockResolvedValue('valid-refresh-token');
      mockJwt.sign.mockReturnValue('new-token');
      mockRedis.set.mockResolvedValue(undefined);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result.accessToken).toBe('new-token');
    });

    it('should throw UnauthorizedException if token not in Redis', async () => {
      mockJwt.verifyAsync.mockResolvedValue({ sub: '1', email: 'test@test.com', role: 'USER' });
      mockRedis.get.mockResolvedValue(null);

      await expect(service.refreshTokens('stale-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      mockJwt.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      mockRedis.del.mockResolvedValue(undefined);

      await service.logout('user-1');

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1');
    });
  });
});
