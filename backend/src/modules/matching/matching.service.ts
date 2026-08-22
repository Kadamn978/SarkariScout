import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  constructor(private prisma: PrismaService) {}

  async findMatchingJobs(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) return [];

    const jobs = await this.prisma.job.findMany({
      where: { status: 'OPEN', applyEnd: { gte: new Date() } },
      orderBy: { applyEnd: 'asc' },
    });

    return jobs
      .map((job) => ({ job, score: this.calculateMatchScore(profile, job) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((m) => ({ ...m.job, matchScore: m.score }));
  }

  private calculateMatchScore(profile: any, job: any): number {
    let score = 0;

    if (this.matchesEducation(profile, job)) score += 30;
    if (this.matchesState(profile, job)) score += 25;
    if (this.matchesCategory(profile, job)) score += 15;
    if (this.matchesAge(profile, job)) score += 15;
    if (this.matchesExamFamily(profile, job)) score += 15;

    return score;
  }

  private matchesEducation(profile: any, job: any): boolean {
    if (!profile.educationLevel) return true;
    const levels = ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'PhD'];
    const userProfileLevel = levels.indexOf(profile.educationLevel);
    const jobLevels: string[] = job.qualificationLevels ? JSON.parse(job.qualificationLevels) : [];
    if (jobLevels.length === 0) return true;
    return jobLevels.some((jl: string) => levels.indexOf(jl) <= userProfileLevel);
  }

  private matchesState(profile: any, job: any): boolean {
    if (!profile.state || job.state === 'ALL_IN') return true;
    return profile.state === job.state;
  }

  private matchesCategory(profile: any, job: any): boolean {
    if (!profile.category) return true;
    const fees: Record<string, string> = job.categoryFeesJson ? JSON.parse(job.categoryFeesJson) : {};
    return !(profile.category in fees && fees[profile.category] === '0');
  }

  private matchesAge(profile: any, job: any): boolean {
    if (!profile.dob || !job.ageMax) return true;
    const age = Math.floor((Date.now() - new Date(profile.dob).getTime()) / 31557600000);
    const min = job.ageMin || 18;
    return age >= min && age <= job.ageMax;
  }

  private matchesExamFamily(profile: any, job: any): boolean {
    if (!profile.examFamilies) return true;
    const families: string[] = JSON.parse(profile.examFamilies);
    if (families.length === 0) return true;
    return families.some((f) => job.examFamily?.toLowerCase().includes(f.toLowerCase()));
  }

  async getJobMatchStats() {
    const totalJobs = await this.prisma.job.count({ where: { status: 'OPEN' } });
    const totalUsers = await this.prisma.profile.count();
    const expiringSoon = await this.prisma.job.count({
      where: { status: 'OPEN', applyEnd: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) } },
    });
    return { totalJobs, totalUsers, expiringSoon };
  }
}
