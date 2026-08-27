import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Controller('health')
export class HealthController {
  private startTime = Date.now();

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

  @Get('uptime')
  uptime() {
    const uptimeMs = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    return {
      status: 'ok',
      uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      uptimeMs,
      timestamp: new Date().toISOString(),
    };
  }
}
