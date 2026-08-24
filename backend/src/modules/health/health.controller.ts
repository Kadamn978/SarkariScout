import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const result: Record<string, string> = { timestamp: new Date().toISOString() };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.database = 'connected';
    } catch {
      result.database = 'disconnected';
    }

    try {
      await this.redis.ping();
      result.redis = 'connected';
    } catch {
      result.redis = 'disconnected';
    }

    if (result.database !== 'connected' || result.redis !== 'connected') {
      throw new HttpException(
        { status: 'error', ...result },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { status: 'ok', ...result };
  }
}
