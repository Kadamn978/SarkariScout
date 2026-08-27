import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

export interface JobChangeDetection {
  jobId: string;
  type: string;
  field: string;
  before: string;
  after: string;
}

@Injectable()
export class ChangeDetectorService {
  private readonly logger = new Logger(ChangeDetectorService.name);
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async detectChanges(jobId: string, newData: Record<string, any>): Promise<JobChangeDetection[]> {
    const existing = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) return [];

    const changes: JobChangeDetection[] = [];
    const trackedFields: Record<string, string> = {
      applyEnd: 'DEADLINE',
      examDate: 'EXAM_DATE',
      examVenue: 'VENUE',
      totalVacancies: 'VACANCY',
      applyUrl: 'CORRIGENDUM',
      status: 'STATUS',
    };

    for (const [field, changeType] of Object.entries(trackedFields)) {
      const oldVal = existing[field as keyof typeof existing];
      const newVal = newData[field];
      if (newVal === undefined || newVal === null) continue;
      if (String(oldVal) === String(newVal)) continue;

      changes.push({
        jobId,
        type: changeType,
        field,
        before: String(oldVal ?? ''),
        after: String(newVal),
      });
    }

    return changes;
  }

  async recordChanges(changes: JobChangeDetection[]): Promise<number> {
    if (changes.length === 0) return 0;

    const data = changes.map((change) => ({
      jobId: change.jobId,
      type: change.type as 'EXAM_DATE' | 'VENUE' | 'DEADLINE' | 'CORRIGENDUM' | 'RESULT' | 'ADMIT_CARD',
      field: change.field,
      before: change.before || null,
      after: change.after,
      detectedAt: new Date(),
      notified: false,
    }));

    try {
      const result = await this.prisma.jobChange.createMany({ data, skipDuplicates: true });
      for (const change of changes) {
        this.logger.log(`Change detected: ${change.field} on job ${change.jobId}: ${change.before} -> ${change.after}`);
      }
      return result.count;
    } catch (e) {
      this.logger.error(`Failed to record changes: ${(e as Error).message}`);
      return 0;
    }
  }

  async notifyTrackedUsers(jobId: string, changes: JobChangeDetection[]): Promise<number> {
    const trackers = await this.prisma.userJob.findMany({
      where: { jobId },
      include: { user: { include: { profile: true } } },
    });

    let notified = 0;
    for (const tracker of trackers) {
      const profile = tracker.user.profile;
      if (!profile?.notifyInstant) continue;

      const changeTypes = [...new Set(changes.map((c) => c.type))];
      try {
        await this.emailService.sendInstantAlert(
          tracker.userId,
          jobId,
          changeTypes.join(', '),
        );
        notified++;
        this.logger.log(`Notified ${tracker.user.email} about job changes: ${changeTypes.join(', ')}`);
      } catch (err) {
        this.logger.error(`Failed to notify ${tracker.user.email}: ${(err as Error).message}`);
      }
    }
    return notified;
  }

  async getJobChanges(jobId: string, limit = 20) {
    return this.prisma.jobChange.findMany({
      where: { jobId },
      orderBy: { detectedAt: 'desc' },
      take: limit,
    });
  }

  async getRecentChanges(limit = 50) {
    return this.prisma.jobChange.findMany({
      orderBy: { detectedAt: 'desc' },
      take: limit,
      include: { job: { select: { title: true, org: true } } },
    });
  }

  async getUnnotifiedChanges() {
    return this.prisma.jobChange.findMany({
      where: { notified: false },
      orderBy: { detectedAt: 'asc' },
      take: 1000,
      include: { job: { select: { title: true, org: true } } },
    });
  }

  async markNotified(changeIds: string[]) {
    await this.prisma.jobChange.updateMany({
      where: { id: { in: changeIds } },
      data: { notified: true },
    });
  }
}
