import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Profile, Job } from '@prisma/client';

export interface MatchResult {
  jobId: string;
  matchScore: number;
  eligible: boolean;
  reasons: string[];
  breakdown: {
    education: number;
    state: number;
    category: number;
    age: number;
    gender: number;
    qualification: number;
  };
}

const AGE_LEVELS = ['10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Engineering', 'Post Graduate', 'PhD'];

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  constructor(private prisma: PrismaService) {}

  async findMatchingJobs(userId: string): Promise<MatchResult[]> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) return [];

    const jobs = await this.prisma.job.findMany({
      where: { status: 'OPEN', applyEnd: { gte: new Date() } },
      orderBy: { applyEnd: 'asc' },
      take: 500,
    });

    const results = jobs.map((job) => this.matchJob(profile, job));
    return results
      .filter((r) => r.eligible)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  async findMatchingJobsPublic(filters: {
    state?: string;
    category?: string;
    qualification?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Record<string, unknown> = { status: 'OPEN', applyEnd: { gte: new Date() } };

    if (filters.state && filters.state !== 'ALL_IN') {
      where.OR = [
        { state: 'ALL_IN' },
        { state: filters.state },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.qualification) {
      where.qualificationLevels = { contains: filters.qualification };
    }

    if (filters.search) {
      where.OR = [
        ...(Array.isArray(where.OR) ? where.OR : []),
        { title: { contains: filters.search } },
        { org: { contains: filters.search } },
        { postNames: { contains: filters.search } },
      ];
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({ where, orderBy: { applyEnd: 'asc' }, skip, take: limit }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  matchJob(profile: Profile, job: Job): MatchResult {
    const reasons: string[] = [];
    const breakdown = {
      education: 0,
      state: 0,
      category: 0,
      age: 0,
      gender: 0,
      qualification: 0,
    };

    const eduMatch = this.checkEducation(profile, job);
    breakdown.education = eduMatch.score;
    if (eduMatch.reason) reasons.push(eduMatch.reason);

    const stateMatch = this.checkState(profile, job);
    breakdown.state = stateMatch.score;
    if (stateMatch.reason) reasons.push(stateMatch.reason);

    const catMatch = this.checkCategory(profile, job);
    breakdown.category = catMatch.score;
    if (catMatch.reason) reasons.push(catMatch.reason);

    const ageMatch = this.checkAge(profile, job);
    breakdown.age = ageMatch.score;
    if (ageMatch.reason) reasons.push(ageMatch.reason);

    const genderMatch = this.checkGender(profile, job);
    breakdown.gender = genderMatch.score;
    if (genderMatch.reason) reasons.push(genderMatch.reason);

    const qualMatch = this.checkQualificationText(profile, job);
    breakdown.qualification = qualMatch.score;
    if (qualMatch.reason) reasons.push(qualMatch.reason);

    const matchScore = breakdown.education + breakdown.state + breakdown.category +
      breakdown.age + breakdown.gender + breakdown.qualification;

    const hardBlockers = [eduMatch.blocked, ageMatch.blocked, genderMatch.blocked];
    const eligible = !hardBlockers.some(Boolean);

    return { jobId: job.id, matchScore, eligible, reasons, breakdown };
  }

  private checkEducation(profile: Profile, job: Job): { score: number; reason?: string; blocked?: boolean } {
    if (!profile.educationLevel) return { score: 15 };

    const userLevel = AGE_LEVELS.indexOf(profile.educationLevel);
    if (userLevel === -1) return { score: 10 };

    const jobLevels: string[] = job.qualificationLevels ? JSON.parse(job.qualificationLevels) : [];
    if (jobLevels.length === 0) return { score: 15 };

    const qualifies = jobLevels.some((jl: string) => {
      const jlIdx = AGE_LEVELS.indexOf(jl);
      return jlIdx !== -1 && jlIdx <= userLevel;
    });

    if (qualifies) return { score: 30 };

    const lowestRequired = Math.min(...jobLevels.map((jl: string) => AGE_LEVELS.indexOf(jl)).filter((i) => i !== -1));
    return {
      score: 0,
      reason: `Requires ${jobLevels.join('/')} but you have ${profile.educationLevel}`,
      blocked: true,
    };
  }

  private checkState(profile: Profile, job: Job): { score: number; reason?: string } {
    if (!profile.state) return { score: 15 };
    if (job.state === 'ALL_IN') return { score: 25 };
    if (profile.state === job.state) return { score: 25 };
    return { score: 0, reason: `This job is for ${job.state} only` };
  }

  private checkCategory(profile: Profile, job: Job): { score: number; reason?: string } {
    if (!profile.category) return { score: 10 };
    if (!job.categoryFeesJson) return { score: 10 };

    const fees: Record<string, string> = JSON.parse(job.categoryFeesJson);
    const fee = fees[profile.category];

    if (fee === '0' || fee === undefined) return { score: 15 };
    return { score: 5, reason: `Fee ₹${fee} for ${profile.category} category` };
  }

  private checkAge(profile: Profile, job: Job): { score: number; reason?: string; blocked?: boolean } {
    if (!profile.dob) return { score: 15 };

    const dob = new Date(profile.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const min = job.ageMin || 18;
    const max = job.ageMax || 60;

    if (age >= min && age <= max) return { score: 20 };

    const ageRelief = this.getAgeRelief(profile.category);
    if (age >= min && age <= max + ageRelief) {
      return { score: 10, reason: `Age ${age}, max ${max} (+${ageRelief} relaxation for ${profile.category})` };
    }

    return {
      score: 0,
      reason: `Age ${age} is outside range ${min}-${max}`,
      blocked: true,
    };
  }

  private checkGender(profile: Profile, job: Job): { score: number; reason?: string; blocked?: boolean } {
    if (!profile.gender) return { score: 10 };
    if (!job.gender || job.gender === 'ALL') return { score: 15 };
    if (profile.gender === job.gender) return { score: 15 };
    return {
      score: 0,
      reason: `This job is for ${job.gender} candidates only`,
      blocked: true,
    };
  }

  private checkQualificationText(profile: Profile, job: Job): { score: number; reason?: string } {
    if (!job.qualificationText) return { score: 10 };
    if (!profile.degrees) return { score: 10 };

    const degrees: string[] = JSON.parse(profile.degrees);
    const reqText = job.qualificationText.toLowerCase();

    const matches = degrees.some((d) => reqText.includes(d.toLowerCase()));
    if (matches) return { score: 10 };

    return { score: 5 };
  }

  private getAgeRelief(category?: string | null): number {
    switch (category) {
      case 'OBC': return 3;
      case 'SC': return 5;
      case 'ST': return 5;
      case 'PwD': return 10;
      case 'ExServiceman': return 5;
      default: return 0;
    }
  }

  async getJobMatchStats() {
    const totalJobs = await this.prisma.job.count({ where: { status: 'OPEN' } });
    const openJobs = await this.prisma.job.count({
      where: { status: 'OPEN', applyEnd: { gte: new Date() } },
    });
    const expiringSoon = await this.prisma.job.count({
      where: { status: 'OPEN', applyEnd: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) } },
    });
    const totalUsers = await this.prisma.profile.count();
    const categoryStats = await this.prisma.job.groupBy({
      by: ['category'],
      where: { status: 'OPEN' },
      _count: true,
    });
    const stateStats = await this.prisma.job.groupBy({
      by: ['state'],
      where: { status: 'OPEN', state: { not: 'ALL_IN' } },
      _count: true,
      orderBy: { _count: { state: 'desc' } },
      take: 10,
    });

    return {
      totalJobs, openJobs, expiringSoon, totalUsers,
      byCategory: categoryStats.map((c) => ({ category: c.category, count: c._count })),
      topStates: stateStats.map((s) => ({ state: s.state, count: s._count })),
    };
  }
}
