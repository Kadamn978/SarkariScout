import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

export interface DeletionCheckResult {
  sourceId: string;
  sourceName: string;
  totalChecked: number;
  stillAlive: number;
  deleted: number;
  deletedJobs: { id: string; title: string; org: string; sourceUrl: string }[];
  errors: string[];
}

@Injectable()
export class JobDeletionDetectorService {
  private readonly logger = new Logger(JobDeletionDetectorService.name);
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
  private readonly IST_OFFSET = 5.5 * 60 * 60 * 1000;

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async checkSourceForDeletions(sourceId: string): Promise<DeletionCheckResult> {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) {
      return { sourceId, sourceName: 'Unknown', totalChecked: 0, stillAlive: 0, deleted: 0, deletedJobs: [], errors: ['Source not found'] };
    }

    const jobs = await this.prisma.job.findMany({
      where: { sourceId, status: 'OPEN' },
      select: { id: true, title: true, org: true, sourceUrl: true, lastSeenAt: true },
    });

    this.logger.log(`Checking ${jobs.length} jobs from ${source.name} for deletions`);
    const errors: string[] = [];
    const deletedJobs: { id: string; title: string; org: string; sourceUrl: string }[] = [];
    let stillAlive = 0;

    for (const job of jobs) {
      try {
        const isAlive = await this.checkUrlAlive(job.sourceUrl);
        if (isAlive) {
          stillAlive++;
          // Update lastSeenAt
          await this.prisma.job.update({
            where: { id: job.id },
            data: { lastSeenAt: new Date() },
          });
        } else {
          deletedJobs.push({ id: job.id, title: job.title, org: job.org, sourceUrl: job.sourceUrl });
          this.logger.warn(`Job appears deleted: ${job.title} (${job.sourceUrl})`);
        }
      } catch (e) {
        // Network error — don't mark as deleted, just log
        const msg = (e as Error).message;
        if (!errors.includes(msg)) errors.push(msg);
        stillAlive++; // assume alive on network error
      }
      // Small delay to avoid hammering the server
      await this.sleep(1000);
    }

    return {
      sourceId,
      sourceName: source.name,
      totalChecked: jobs.length,
      stillAlive,
      deleted: deletedJobs.length,
      deletedJobs,
      errors,
    };
  }

  async markDeletedJobs(deletedJobs: { id: string; title: string }[]): Promise<number> {
    let marked = 0;
    for (const job of deletedJobs) {
      try {
        await this.prisma.job.update({
          where: { id: job.id },
          data: {
            status: 'CLOSED',
            applyUrl: null,
            eligibilityCriteria: `${job.title} — This job listing has been removed from the official source. Please verify on the official website before applying.`,
          },
        });
        marked++;
      } catch (e) {
        this.logger.error(`Failed to mark deleted: ${job.title}: ${(e as Error).message}`);
      }
    }
    return marked;
  }

  async notifyDeletedJobs(deletedJobs: { id: string; title: string; org: string }[]): Promise<void> {
    if (deletedJobs.length === 0) return;

    // Find users tracking any of these jobs
    for (const job of deletedJobs) {
      const trackedUsers = await this.prisma.userJob.findMany({
        where: { jobId: job.id },
        include: { user: { select: { id: true, email: true, name: true } } },
      });

      for (const tracking of trackedUsers) {
        try {
          await this.email.sendJobDeletionNotice(
            tracking.user.email,
            tracking.user.name || 'Candidate',
            job.title,
            job.org,
          );
        } catch (e) {
          this.logger.error(`Failed to notify user ${tracking.user.email} about deleted job: ${(e as Error).message}`);
        }
      }
    }
  }

  async runFullDeletionCheck(): Promise<DeletionCheckResult[]> {
    const sources = await this.prisma.source.findMany({
      where: { enabled: true },
      select: { id: true, name: true },
    });

    this.logger.log(`Running deletion check across ${sources.length} sources`);
    const results: DeletionCheckResult[] = [];

    for (const source of sources) {
      const result = await this.checkSourceForDeletions(source.id);
      results.push(result);

      if (result.deleted > 0) {
        this.logger.warn(`${result.sourceName}: ${result.deleted} jobs appear deleted`);
        await this.markDeletedJobs(result.deletedJobs);
        await this.notifyDeletedJobs(result.deletedJobs);
      }

      await this.sleep(5000); // 5 second delay between sources
    }

    return results;
  }

  private async checkUrlAlive(url: string): Promise<boolean> {
    if (!url || url === 'about:blank') return false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': this.USER_AGENT },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      // 200-399 = alive, 404/410 = deleted, 403/500 = server issue (assume alive)
      return res.status < 400;
    } catch (e) {
      // Network error — don't assume deleted
      throw e;
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
