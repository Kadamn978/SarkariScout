import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PapersService {
  private readonly logger = new Logger(PapersService.name);
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { examFamily?: string; year?: number; qualification?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.examFamily) where.examFamily = filters.examFamily;
    if (filters?.year) where.year = filters.year;
    if (filters?.qualification) where.qualification = filters.qualification;

    const [papers, total] = await Promise.all([
      this.prisma.previousPaper.findMany({
        where,
        orderBy: [{ year: 'desc' }, { examFamily: 'asc' }],
        skip, take: limit,
      }),
      this.prisma.previousPaper.count({ where }),
    ]);

    return {
      papers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const paper = await this.prisma.previousPaper.findUnique({ where: { id } });
    if (!paper) throw new NotFoundException('Paper not found');
    return paper;
  }

  async incrementDownload(id: string) {
    await this.prisma.previousPaper.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  async getExamFamilies() {
    const families = await this.prisma.previousPaper.groupBy({
      by: ['examFamily'],
      _count: true,
      orderBy: { _count: { examFamily: 'desc' } },
    });
    return families.map((f) => ({ examFamily: f.examFamily, count: f._count }));
  }

  async getPopular(limit = 10) {
    return this.prisma.previousPaper.findMany({
      orderBy: { downloadCount: 'desc' },
      take: limit,
    });
  }

  async createPaper(data: {
    title: string; examFamily: string; year: number;
    qualification?: string; fileUrl?: string; externalUrl?: string;
    description?: string;
  }) {
    return this.prisma.previousPaper.create({ data });
  }
}
