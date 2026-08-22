import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeDetectorService } from '../changes/change-detector.service';
import * as crypto from 'crypto';

export interface CrawledJob {
  sourceUrl: string;
  org: string;
  title: string;
  postNames: string[];
  totalVacancies?: number;
  state?: string;
  qualificationText?: string;
  ageMin?: number;
  ageMax?: number;
  applyStart?: Date;
  applyEnd?: Date;
  examDate?: Date;
  applyUrl?: string;
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  constructor(
    private prisma: PrismaService,
    private changeDetector: ChangeDetectorService,
  ) {}

  async crawlSource(sourceId: string) {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source || !source.enabled) return { added: 0, updated: 0, errors: ['Source disabled'] };

    this.logger.log(`Crawling ${source.name}`);
    const errors: string[] = [];
    let added = 0, updated = 0;

    try {
      const jobs = await this.fetchJobs(source);
      for (const job of jobs) {
        try {
          const result = await this.upsertJob(job, source.id);
          if (result === 'created') added++; else updated++;
        } catch (e) { errors.push((e as Error).message); }
      }
      await this.prisma.source.update({
        where: { id: sourceId },
        data: { lastRunAt: new Date(), lastRunStatus: errors.length ? 'partial' : 'ok', itemsPerRun: jobs.length },
      });
    } catch (e) {
      errors.push((e as Error).message);
      await this.prisma.source.update({
        where: { id: sourceId },
        data: { lastRunAt: new Date(), lastRunStatus: 'error' },
      });
    }
    return { added, updated, errors };
  }

  async crawlAll() {
    const sources = await this.prisma.source.findMany({ where: { enabled: true } });
    const results: Record<string, any> = {};
    for (const s of sources) results[s.id] = await this.crawlSource(s.id);
    return results;
  }

  private async fetchJobs(source: any): Promise<CrawledJob[]> {
    try {
      const res = await fetch(source.baseUrl, {
        headers: { 'User-Agent': 'SarkariScout/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      const html = await res.text();
      return this.parseGovtJobsHtml(html, source.baseUrl);
    } catch (e) {
      this.logger.warn(`Fetch failed: ${(e as Error).message}`);
      return [];
    }
  }

  private parseGovtJobsHtml(html: string, baseUrl: string): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const text = match[2].trim();
      if (text.length > 20 && (text.toLowerCase().includes('recruitment') || text.toLowerCase().includes('vacancy'))) {
        jobs.push({
          sourceUrl: url.startsWith('http') ? url : new URL(url, baseUrl).href,
          org: this.extractOrg(text),
          title: text,
          postNames: [text],
        });
      }
    }
    return jobs;
  }

  private extractOrg(title: string): string {
    const orgPatterns = ['SSC', 'UPSC', 'IBPS', 'RRB', 'MPSC', 'BPSC', 'JPSC', 'APPSC', 'TSPSC', 'GATE'];
    for (const org of orgPatterns) {
      if (title.toUpperCase().includes(org)) return org;
    }
    return 'Government of India';
  }

  private generateFingerprint(job: CrawledJob): string {
    const data = `${job.org}|${job.title}|${job.sourceUrl}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private async upsertJob(job: CrawledJob, sourceId: string): Promise<'created' | 'updated'> {
    const fingerprint = this.generateFingerprint(job);
    const existing = await this.prisma.job.findUnique({ where: { fingerprint } });

    const data = {
      sourceId, sourceUrl: job.sourceUrl, org: job.org, title: job.title,
      postNames: JSON.stringify(job.postNames), totalVacancies: job.totalVacancies,
      state: job.state || 'ALL_IN', qualificationText: job.qualificationText,
      qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: job.ageMin, ageMax: job.ageMax,
      applyStart: job.applyStart, applyEnd: job.applyEnd, examDate: job.examDate,
      applyUrl: job.applyUrl, lastSeenAt: new Date(),
    };

    if (existing) {
      const changes = await this.changeDetector.detectChanges(existing.id, data);
      if (changes.length > 0) {
        await this.changeDetector.recordChanges(changes);
        await this.changeDetector.notifyTrackedUsers(existing.id, changes);
      }
      await this.prisma.job.update({ where: { id: existing.id }, data });
      return 'updated';
    } else {
      await this.prisma.job.create({ data: { ...data, fingerprint, status: 'OPEN' } });
      return 'created';
    }
  }
}
