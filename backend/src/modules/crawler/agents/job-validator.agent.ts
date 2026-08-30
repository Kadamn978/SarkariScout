import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ScrapedOfficialJob } from './official-scraper.agent';

export interface ValidatedJob {
  title: string;
  org: string;
  description: string;
  postNames: string[];
  vacancies: number | null;
  location: string;
  applyUrl: string;
  sourceUrl: string;
  officialDomain: string;
  isValid: boolean;
  skipReason?: string;
}

@Injectable()
export class JobValidatorAgent {
  private readonly logger = new Logger(JobValidatorAgent.name);

  constructor(private prisma: PrismaService) {}

  async validateAndInsert(jobs: ScrapedOfficialJob[]): Promise<{
    inserted: number;
    skipped: number;
    duplicates: number;
    results: ValidatedJob[];
  }> {
    let inserted = 0, skipped = 0, duplicates = 0;
    const results: ValidatedJob[] = [];

    for (const job of jobs) {
      const validation = await this.validateJob(job);
      results.push(validation);

      if (!validation.isValid) {
        skipped++;
        this.logger.debug(`Skipped: ${job.title} — ${validation.skipReason}`);
        continue;
      }

      // Check for duplicates
      const isDuplicate = await this.checkDuplicate(job);
      if (isDuplicate) {
        duplicates++;
        continue;
      }

      // Insert job
      try {
        await this.insertJob(job);
        inserted++;
        this.logger.log(`Inserted: ${job.title}`);
      } catch (e) {
        this.logger.error(`Failed to insert ${job.title}: ${(e as Error).message}`);
      }
    }

    this.logger.log(`Validation complete: ${inserted} inserted, ${skipped} skipped, ${duplicates} duplicates`);
    return { inserted, skipped, duplicates, results };
  }

  private async validateJob(job: ScrapedOfficialJob): Promise<ValidatedJob> {
    const base = { ...job, isValid: true, skipReason: undefined };

    // 1. Title too short
    if (job.title.length < 15) {
      return { ...base, isValid: false, skipReason: 'Title too short (< 15 chars)' };
    }

    // 2. Looks like navigation/page link
    if (/^(Home|Back|Next|Previous|Click here|Read more)$/i.test(job.title.trim())) {
      return { ...base, isValid: false, skipReason: 'Navigation link, not a job' };
    }

    // 3. Must have at least one job-related keyword
    if (!this.hasJobKeywords(job.title) && !this.hasJobKeywords(job.description)) {
      return { ...base, isValid: false, skipReason: 'No job-related keywords found' };
    }

    // 4. Apply URL must be valid
    if (!job.applyUrl || !job.applyUrl.startsWith('http')) {
      return { ...base, isValid: false, skipReason: 'Invalid apply URL' };
    }

    // 5. Org must be recognizable
    if (!job.org || job.org.length < 2) {
      return { ...base, isValid: false, skipReason: 'No recognizable organization' };
    }

    return base;
  }

  private hasJobKeywords(text: string): boolean {
    const keywords = [
      /recruit/i, /vacanc/i, /examination/i, /constable/i, /inspector/i,
      /clerk/i, /officer/i, /\bpo\b/i, /notification/i, /apply/i,
      /online form/i, /last date/i, /group [a-d]/i, /grade [a-d]/i,
      /assistant/i, /engineer/i, /technician/i, /graduate/i,
      /eligible/i, /qualification/i, /age limit/i, /salary/i,
      /pay scale/i, /application fee/i,
    ];
    return keywords.some(kw => kw.test(text));
  }

  private async checkDuplicate(job: ScrapedOfficialJob): Promise<boolean> {
    // Check by title similarity
    const title = job.title.toLowerCase().trim().substring(0, 60);

    const existing = await this.prisma.job.findFirst({
      where: {
        title: { contains: title.substring(0, 40) },
        status: 'OPEN',
      },
      select: { id: true },
    });

    return !!existing;
  }

  private async insertJob(job: ScrapedOfficialJob): Promise<void> {
    const source = await this.prisma.source.findFirst({
      where: { baseUrl: { contains: job.officialDomain } },
    });

    const sourceId = source?.id || 'unknown';

    // Generate fingerprint
    const crypto = await import('crypto');
    const fingerprint = crypto.createHash('sha256')
      .update(`${job.title}-${job.org}-${job.officialDomain}`)
      .digest('hex')
      .substring(0, 32);

    await this.prisma.job.create({
      data: {
        fingerprint,
        sourceId,
        sourceUrl: job.applyUrl,
        sourceType: 'OFFICIAL',
        title: job.title,
        org: job.org,
        postNames: JSON.stringify(job.postNames),
        description: job.description,
        vacancies: job.vacancies,
        location: job.location,
        category: 'GOVERNMENT',
        type: 'FULL_TIME',
        status: 'OPEN',
        salary: null,
        eligibility: null,
        importantDates: null,
        howToApply: null,
        officialNotificationUrl: job.sourceUrl,
      },
    });
  }
}
