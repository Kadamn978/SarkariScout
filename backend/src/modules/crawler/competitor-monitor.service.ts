import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrawlerService, CrawledJob } from './crawler.service';
import { validateUrl, sanitizeError } from './url-validator';
import { cleanHtml, extractOrgFromTitle } from './shared-utils';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

interface CompetitorConfig {
  siteName: string;
  baseUrl: string;
  selectors: {
    jobList: string;
    title: string;
    link: string;
    org?: string;
    date?: string;
    vacancies?: string;
  };
}

@Injectable()
export class CompetitorMonitorService {
  private readonly logger = new Logger(CompetitorMonitorService.name);

  constructor(
    private prisma: PrismaService,
    private crawlerService: CrawlerService,
  ) {}

  async monitorAll(): Promise<{ added: number; updated: number; skipped: number; errors: string[] }> {
    const competitors = await this.prisma.source.findMany({
      where: { enabled: true, configJson: { contains: '"isCompetitor":true' } },
    });

    let added = 0, updated = 0, skipped = 0;
    const errors: string[] = [];

    for (const comp of competitors) {
      try {
        const result = await this.monitorSite(comp.id, comp.baseUrl, comp.name);
        added += result.added;
        updated += result.updated;
        skipped += result.skipped;
      } catch (e) {
        const msg = sanitizeError(e);
        errors.push(`${comp.name}: ${msg}`);
        this.logger.error(`Competitor monitor failed for ${comp.name}: ${(e as Error).message}`);
      }
      // Rate limit between sites
      await new Promise(r => setTimeout(r, 3000));
    }

    return { added, updated, skipped, errors };
  }

  async monitorSite(sourceId: string, url: string, siteName: string) {
    this.logger.log(`Monitoring competitor: ${siteName} (${url})`);

    const html = await this.fetchWithRetry(url);
    if (!html) return { added: 0, updated: 0, skipped: 0 };

    const jobs = this.parseCompetitorHtml(html, siteName, url);
    this.logger.log(`Found ${jobs.length} jobs from ${siteName}`);

    let added = 0, updated = 0, skipped = 0;

    for (const job of jobs) {
      try {
        // Check if job already exists from any source
        const existing = await this.findExistingJob(job);
        if (existing) {
          skipped++;
          continue;
        }

        // Upsert as new job linked to competitor source
        const result = await this.crawlerService.upsertFromCrawledJob({
          ...job,
          sourceUrl: job.sourceUrl || url,
        }, sourceId);

        if (result === 'created') added++; else updated++;
      } catch (e) {
        this.logger.warn(`Failed to process competitor job: ${(e as Error).message}`);
      }
    }

    // Update source stats
    await this.prisma.source.update({
      where: { id: sourceId },
      data: { lastRunAt: new Date(), lastRunStatus: 'ok', itemsPerRun: jobs.length },
    });

    return { added, updated, skipped };
  }

  private async findExistingJob(job: CrawledJob): Promise<boolean> {
    // Check by title similarity (fuzzy match)
    const title = job.title.toLowerCase().trim();
    const org = job.org?.toLowerCase().trim();

    if (!title) return false;

    // Try exact title match first
    const exact = await this.prisma.job.findFirst({
      where: {
        title: { contains: title.substring(0, 50) },
        status: 'OPEN',
      },
      select: { id: true },
    });

    if (exact) return true;

    // Try org + partial title match
    if (org) {
      const orgMatch = await this.prisma.job.findFirst({
        where: {
          org: { contains: org.substring(0, 30) },
          title: { contains: title.substring(0, 30) },
          status: 'OPEN',
        },
        select: { id: true },
      });
      if (orgMatch) return true;
    }

    return false;
  }

  private parseCompetitorHtml(html: string, siteName: string, baseUrl: string): CrawledJob[] {
    const jobs: CrawledJob[] = [];

    // Generic link-based extraction
    // Match: <a href="...">text containing recruitment/vacancy/job keywords</a>
    const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkPattern.exec(html)) !== null) {
      const url = match[1];
      const text = cleanHtml(match[2]).trim();

      if (text.length < 15) continue;
      if (!this.isJobRelated(text)) continue;

      const fullUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href;

      // Skip navigation/footer links
      if (this.isNavigationLink(fullUrl)) continue;

      const org = extractOrgFromTitle(text);

      jobs.push({
        sourceUrl: fullUrl,
        org,
        title: text,
        postNames: [text],
        state: 'ALL_IN',
        category: 'GOVERNMENT',
      });
    }

    // Deduplicate by title
    const seen = new Set<string>();
    return jobs.filter(j => {
      const key = j.title.toLowerCase().substring(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private isJobRelated(text: string): boolean {
    const keywords = [
      /recruit/i, /vacanc/i, /examination/i, /constable/i, /inspector/i,
      /clerk/i, /officer/i, /\bpo\b/i, /ibps/i, /ssc/i, /upsc/i, /rrb/i,
      /notification/i, /apply/i, /online form/i, /last date/i,
      /syllabus/i, /admit card/i, /result/i, /answer key/i,
      /group [a-d]/i, /grade [a-d]/i, /level \d/i,
      /sarkari/i, /naukri/i, /government/i, /psu/i, /bank/i,
      /assistant/i, /engineer/i, /technician/i, /graduate/i,
      / eligible/i, /qualification/i, /age limit/i,
    ];
    return keywords.some(kw => kw.test(text));
  }

  private isNavigationLink(url: string): boolean {
    const skip = [
      /\/tag\//i, /\/category\//i, /\/page\//i, /\/author\//i,
      /facebook\.com/i, /twitter\.com/i, /instagram\.com/i,
      /youtube\.com/i, /linkedin\.com/i, /telegram\.me/i,
      /javascript:/i, /mailto:/i, /tel:/i,
      /\.pdf$/i, /\.jpg$/i, /\.png$/i,
    ];
    return skip.some(p => p.test(url));
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const validation = validateUrl(url);
        if (!validation.valid) {
          this.logger.warn(`Invalid URL: ${validation.error}`);
          return null;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(url, {
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          this.logger.warn(`HTTP ${response.status} from ${url}`);
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 3000 * attempt));
            continue;
          }
          return null;
        }

        return await response.text();
      } catch (e) {
        this.logger.warn(`Fetch attempt ${attempt} failed for ${url}: ${(e as Error).message}`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 3000 * attempt));
        }
      }
    }
    return null;
  }

  async getCompetitorStats() {
    const competitors = await this.prisma.source.findMany({
      where: { configJson: { contains: '"isCompetitor":true' } },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        lastRunAt: true,
        lastRunStatus: true,
        itemsPerRun: true,
      },
    });

    const stats = await Promise.all(
      competitors.map(async (c) => {
        const jobCount = await this.prisma.job.count({
          where: { sourceId: c.id },
        });
        return { ...c, jobsFound: jobCount };
      })
    );

    return stats;
  }
}
