import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    state?: string;
    category?: string;
    examFamily?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      status: (filters?.status as any) || 'OPEN',
    };

    if (filters?.state && filters.state !== 'ALL_IN') {
      where.OR = [{ state: 'ALL_IN' }, { state: filters.state }];
    }
    if (filters?.category) where.category = filters.category;
    if (filters?.examFamily) where.examFamily = filters.examFamily;
    if (filters?.search) {
      const searchWhere = {
        OR: [
          { title: { contains: filters.search } },
          { org: { contains: filters.search } },
          { postNames: { contains: filters.search } },
        ],
      };
      where.OR = [...(where.OR || []), ...searchWhere.OR];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({ where, orderBy: { applyEnd: 'asc' }, skip, take: limit }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs, total, page, limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { changes: { orderBy: { detectedAt: 'desc' }, take: 10 } },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async getUpcomingDeadlines(days = 7) {
    const deadline = new Date(Date.now() + days * 86400000);
    return this.prisma.job.findMany({
      where: {
        status: 'OPEN',
        applyEnd: { gte: new Date(), lte: deadline },
      },
      orderBy: { applyEnd: 'asc' },
    });
  }

  async getRecentJobs(limit = 20) {
    return this.prisma.job.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async trackJob(userId: string, jobId: string, stage?: string) {
    await this.findOne(jobId);
    return this.prisma.userJob.upsert({
      where: { userId_jobId: { userId, jobId } },
      create: { userId, jobId, stage: (stage as any) || 'APPLIED' },
      update: { stage: stage as any },
    });
  }

  async untrackJob(userId: string, jobId: string) {
    return this.prisma.userJob.deleteMany({
      where: { userId, jobId },
    });
  }

  async getTrackedJobs(userId: string) {
    return this.prisma.userJob.findMany({
      where: { userId },
      include: {
        job: {
          include: { changes: { orderBy: { detectedAt: 'desc' }, take: 5 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTrackerStage(userId: string, jobId: string, stage: string, notes?: string) {
    const tracker = await this.prisma.userJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (!tracker) throw new NotFoundException('Tracker entry not found');

    return this.prisma.userJob.update({
      where: { id: tracker.id },
      data: { stage: stage as any },
    });
  }

  async getTrackerStats(userId: string) {
    const trackers = await this.prisma.userJob.findMany({
      where: { userId },
      include: { job: { select: { applyEnd: true, status: true } } },
    });

    const now = new Date();
    const active = trackers.filter((t) => (t as any).job?.status === 'OPEN');
    const expired = trackers.filter((t) => (t as any).job?.applyEnd && (t as any).job.applyEnd < now);
    const stageStats = trackers.reduce((acc: Record<string, number>, t) => {
      acc[t.stage] = (acc[t.stage] || 0) + 1;
      return acc;
    }, {});

    return {
      total: trackers.length,
      active: active.length,
      expired: expired.length,
      byStage: stageStats,
    };
  }
}
