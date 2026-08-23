import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from './logger.service';

@Injectable()
export class ErrorLogService {
  private logger = new Logger('ErrorDB');
  constructor(private prisma: PrismaService) {}

  async logError(params: {
    level: 'warn' | 'error' | 'fatal';
    message: string;
    stack?: string;
    method?: string;
    url?: string;
    status?: number;
    userId?: string;
    ip?: string;
    userAgent?: string;
    causedBy?: string;
    meta?: Record<string, any>;
  }) {
    try {
      await (this.prisma as any).errorLog.create({
        data: {
          level: params.level,
          message: params.message,
          stack: params.stack || null,
          method: params.method || null,
          url: params.url || null,
          status: params.status || null,
          userId: params.userId || null,
          ip: params.ip || null,
          userAgent: params.userAgent || null,
          causedBy: params.causedBy || null,
          meta: params.meta ? JSON.stringify(params.meta) : null,
        },
      });
    } catch (e) {
      this.logger.error(`Error log write failed: ${(e as Error).message}`);
    }
  }

  async getRecentErrors(hours = 24, limit = 100) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return (this.prisma as any).errorLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getErrorStats(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const errors = await (this.prisma as any).errorLog.findMany({
      where: { createdAt: { gte: since } },
      select: { level: true, url: true, status: true, message: true, createdAt: true },
    });

    const byLevel = { warn: 0, error: 0, fatal: 0 };
    const byUrl: Record<string, number> = {};
    for (const e of errors) {
      byLevel[e.level as keyof typeof byLevel]++;
      byUrl[e.url || 'unknown'] = (byUrl[e.url || 'unknown'] || 0) + 1;
    }

    return { total: errors.length, byLevel, byUrl, since };
  }
}
