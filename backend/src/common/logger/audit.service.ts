import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Logger } from './logger.service'

@Injectable()
export class AuditService {
  private logger = new Logger('AuditDB')
  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: string
    userId?: string
    ip?: string
    userAgent?: string
    method?: string
    url?: string
    status?: number
    duration?: number
    meta?: Record<string, any>
  }) {
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          action: params.action,
          userId: params.userId || null,
          ip: params.ip || null,
          userAgent: params.userAgent || null,
          method: params.method || null,
          url: params.url || null,
          status: params.status || null,
          duration: params.duration || null,
          meta: params.meta ? JSON.stringify(params.meta) : null,
        },
      })
    } catch (e) {
      this.logger.error(`Audit write failed: ${(e as Error).message}`)
    }
  }

  async logAuth(action: string, userId: string, ip: string, meta?: Record<string, any>) {
    await this.log({ action, userId, ip, meta })
  }

  async logJob(action: string, userId: string, jobId: string, meta?: Record<string, any>) {
    await this.log({ action, userId, meta: { jobId, ...meta } })
  }

  async getRecent(limit = 50) {
    return (this.prisma as any).auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getByUser(userId: string, limit = 50) {
    return (this.prisma as any).auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getByDateRange(start: Date, end: Date) {
    return (this.prisma as any).auditLog.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'desc' },
    })
  }
}
