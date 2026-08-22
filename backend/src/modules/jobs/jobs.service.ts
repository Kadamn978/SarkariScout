import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { state?: string; examFamily?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: (filters?.status as any) || 'OPEN',
    };

    if (filters?.state) where.state = filters.state;
    if (filters?.examFamily) where.examFamily = filters.examFamily;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { org: { contains: filters.search } },
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({ where, orderBy: { applyEnd: 'asc' }, skip, take: limit }),
      this.prisma.job.count({ where }),
    ]);

    return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async trackJob(userId: string, jobId: string) {
    await this.findOne(jobId);
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
