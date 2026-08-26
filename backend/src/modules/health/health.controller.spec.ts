import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: { $queryRaw: jest.Mock };
  let redis: { ping: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() };
    redis = { ping: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthController,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return ok when both DB and Redis connected', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);
    redis.ping.mockResolvedValue('PONG');

    const result = await controller.check() as any;
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.redis).toBe('connected');
    expect(result.timestamp).toBeDefined();
  });

  it('should include a valid ISO timestamp', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);
    redis.ping.mockResolvedValue('PONG');

    const result = await controller.check() as any;
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('should throw 503 when DB disconnected', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));
    redis.ping.mockResolvedValue('PONG');

    try {
      await controller.check();
      fail('Expected HttpException');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = (e as HttpException).getResponse() as any;
      expect(response.status).toBe('error');
      expect(response.database).toBe('disconnected');
      expect(response.redis).toBe('connected');
    }
  });

  it('should throw 503 when Redis disconnected', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);
    redis.ping.mockRejectedValue(new Error('ECONNREFUSED'));

    try {
      await controller.check();
      fail('Expected HttpException');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = (e as HttpException).getResponse() as any;
      expect(response.database).toBe('connected');
      expect(response.redis).toBe('disconnected');
    }
  });

  it('should throw 503 when both disconnected', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('DB down'));
    redis.ping.mockRejectedValue(new Error('Redis down'));

    try {
      await controller.check();
      fail('Expected HttpException');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = (e as HttpException).getResponse() as any;
      expect(response.database).toBe('disconnected');
      expect(response.redis).toBe('disconnected');
    }
  });
});
