import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { BugStatus } from '@prisma/client'

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createBugReport(
    userId: string | null,
    title: string,
    description: string,
    category = 'bug',
    priority = 'medium',
  ) {
    return this.prisma.bugReport.create({
      data: { userId, title, description, category, priority },
    })
  }

  async getMyBugReports(userId: string) {
    return this.prisma.bugReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async getAllBugReports(status?: BugStatus) {
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    return this.prisma.bugReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  async updateBugStatus(id: string, status: BugStatus, adminNotes?: string) {
    const update: Record<string, unknown> = { status }
    if (adminNotes) update.adminNotes = adminNotes
    if (status === 'RESOLVED') update.resolvedAt = new Date()
    return this.prisma.bugReport.update({ where: { id }, data: update })
  }
}
