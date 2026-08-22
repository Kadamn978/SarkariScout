import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { state?: string; examFamily?: string; status?: string }) {
    return this.prisma.job.findMany({
      where: {
        status: (filters?.status as any) || 'OPEN',
        ...(filters?.state && { state: filters.state }),
        ...(filters?.examFamily && { examFamily: filters.examFamily }),
      },
      orderBy: { applyEnd: 'asc' },
      take: 50,
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async trackJob(userId: string, jobId: string) {
    return this.prisma.userJob.upsert({
      where: { userId_jobId: { userId, jobId } },
      create: { userId, jobId },
      update: {},
    });
  }

  async getTrackedJobs(userId: string) {
    return this.prisma.userJob.findMany({
      where: { userId },
      include: { job: true },
    });
  }
}
