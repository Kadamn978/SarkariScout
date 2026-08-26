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
  district?: string;
  category?: string;
  qualificationText?: string;
  qualificationLevels?: string[];
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  generalFee?: number;
  obcFee?: number;
  scStFee?: number;
  applyStart?: Date;
  applyEnd?: Date;
  feePaymentEnd?: Date;
  examDate?: Date;
  applyUrl?: string;
  officialNotificationUrl?: string;
  eligibilityCriteria?: string;
  howToApply?: string;
  selectionProcess?: string;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private prisma: PrismaService,
    private changeDetector: ChangeDetectorService,
  ) {}

  async crawlSource(sourceId: string) {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source || !source.enabled) return { added: 0, updated: 0, errors: ['Source disabled'], duration: 0 };

    const startTime = Date.now();
    const crawlLog = await this.prisma.crawlLog.create({
      data: { sourceId, status: 'running' },
    });

    this.logger.log(`Crawling ${source.name} (${source.type})`);
    const errors: string[] = [];
    let added = 0, updated = 0;

    try {
      const jobs = await this.fetchWithRetry(source);
      this.logger.log(`Fetched ${jobs.length} jobs from ${source.name}`);

      for (const job of jobs) {
        try {
          const result = await this.upsertJob(job, source.id);
          if (result === 'created') added++; else updated++;
        } catch (e) {
          const msg = (e as Error).message;
          if (!errors.includes(msg)) errors.push(msg);
        }
      }

      const status = errors.length ? 'partial' : 'ok';
      await this.prisma.source.update({
        where: { id: sourceId },
        data: { lastRunAt: new Date(), lastRunStatus: status, itemsPerRun: jobs.length, lastRunMessage: null },
      });

      await this.prisma.crawlLog.update({
        where: { id: crawlLog.id },
        data: {
          status, itemsFound: jobs.length, itemsNew: added, itemsUpdated: updated,
          finishedAt: new Date(), duration: Date.now() - startTime,
          errorMessage: errors.length ? errors.join('; ') : null,
        },
      });
    } catch (e) {
      const msg = (e as Error).message;
      errors.push(msg);
      this.logger.error(`Crawl failed for ${source.name}: ${msg}`);

      await this.prisma.source.update({
        where: { id: sourceId },
        data: { lastRunAt: new Date(), lastRunStatus: 'error', lastRunMessage: msg },
      });

      await this.prisma.crawlLog.update({
        where: { id: crawlLog.id },
        data: {
          status: 'error', errorMessage: msg, finishedAt: new Date(),
          duration: Date.now() - startTime,
        },
      });
    }

    const duration = Date.now() - startTime;
    return { added, updated, errors, duration };
  }

  async crawlAll() {
    const sources = await this.prisma.source.findMany({ where: { enabled: true } });
    const results: Record<string, any> = {};

    for (const s of sources) {
      results[s.id] = await this.crawlSource(s.id);
      await this.sleep(2000);
    }

    return results;
  }

  async getSourceStats() {
    const sources = await this.prisma.source.findMany({
      include: { crawlLogs: { orderBy: { startedAt: 'desc' }, take: 5 } },
    });
    return sources.map((s) => ({
      id: s.id, name: s.name, type: s.type, enabled: s.enabled,
      lastRunAt: s.lastRunAt, lastRunStatus: s.lastRunStatus,
      itemsPerRun: s.itemsPerRun, totalItems: s.totalItems,
      recentRuns: s.crawlLogs.length,
      lastError: s.crawlLogs.find((l) => l.status === 'error')?.errorMessage,
    }));
  }

  async getCrawlHistory(sourceId: string, limit = 20) {
    return this.prisma.crawlLog.findMany({
      where: { sourceId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  private async fetchWithRetry(source: any, retries = 3): Promise<CrawledJob[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const jobs = await this.fetchJobs(source);
        return jobs;
      } catch (e) {
        this.logger.warn(`Attempt ${attempt}/${retries} failed for ${source.name}: ${(e as Error).message}`);
        if (attempt < retries) await this.sleep(3000 * attempt);
      }
    }
    return [];
  }

  private async fetchJobs(source: any): Promise<CrawledJob[]> {
    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      ...(source.headersJson ? JSON.parse(source.headersJson) : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(source.baseUrl, {
        headers,
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const contentType = res.headers.get('content-type') || '';

      if (source.type === 'NCS_API' || contentType.includes('application/json')) {
        const json = await res.json();
        return this.parseJsonSource(json, source);
      }

      const html = await res.text();
      return this.parseHtmlSource(html, source);
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  }

  private parseJsonSource(json: any, source: any): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const items = json.data || json.results || json.jobs || json.items || (Array.isArray(json) ? json : []);

    for (const item of items) {
      try {
        jobs.push({
          sourceUrl: item.url || item.link || item.applyUrl || source.baseUrl,
          org: item.organization || item.org || item.recruiter || source.name,
          title: item.title || item.postName || item.designation || '',
          postNames: item.postNames || [item.title || item.postName || ''],
          totalVacancies: item.vacancies || item.totalVacancies || undefined,
          state: item.state || item.location || 'ALL_IN',
          qualificationText: item.qualification || item.qualificationText || '',
          ageMin: item.ageMin || undefined,
          ageMax: item.ageMax || undefined,
          generalFee: item.fee || item.generalFee || undefined,
          applyStart: item.applyStart ? new Date(item.applyStart) : undefined,
          applyEnd: item.applyEnd ? new Date(item.applyEnd) : undefined,
          examDate: item.examDate ? new Date(item.examDate) : undefined,
          applyUrl: item.applyUrl || item.apply_link || undefined,
        });
      } catch (e) {
        this.logger.warn(`Failed to parse JSON job item: ${(e as Error).message}`);
      }
    }
    return jobs;
  }

  private parseHtmlSource(html: string, source: any): CrawledJob[] {
    switch (source.name) {
      case 'SSC': return this.parseSSC(html, source);
      case 'UPSC': return this.parseUPSC(html, source);
      case 'IBPS': return this.parseIBPS(html, source);
      case 'RRB': return this.parseRRB(html, source);
      case 'Employment News': return this.parseRSS(html, source);
      default: return this.parseGeneric(html, source);
    }
  }

  private parseSSC(html: string, source: any): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const titlePattern = /<h\d[^>]*>([^<]*(?:recruitment|vacancy|examination|constable|inspector|clerk)[^<]*)<\/h\d>/gi;
    const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*(?:recruitment|vacancy|examination|apply)[^<]*<\/a>/gi;

    let match;
    while ((match = titlePattern.exec(html)) !== null) {
      const title = this.cleanHtml(match[1]);
      if (title.length < 15) continue;
      jobs.push({
        sourceUrl: source.baseUrl,
        org: 'Staff Selection Commission',
        title,
        postNames: [title],
        state: 'ALL_IN',
        category: 'GOVERNMENT',
      });
    }

    while ((match = linkPattern.exec(html)) !== null) {
      const url = match[1].startsWith('http') ? match[1] : new URL(match[1], source.baseUrl).href;
      const text = this.cleanHtml(match[0]);
      if (text.length < 15) continue;
      const exists = jobs.some((j) => j.title === text || j.sourceUrl === url);
      if (!exists) {
        jobs.push({
          sourceUrl: url,
          org: 'Staff Selection Commission',
          title: text,
          postNames: [text],
          state: 'ALL_IN',
          category: 'GOVERNMENT',
        });
      }
    }
    return jobs;
  }

  private parseUPSC(html: string, source: any): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const patterns = [
      /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*(?:notification|recruitment|examination|vacancy)[^<]*<\/a>/gi,
      /<h\d[^>]*>[^<]*(?:civil services|engineering services|NDA|CDS|IES|CAPF)[^<]*<\/h\d>/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const text = this.cleanHtml(match[1] || match[0]);
        if (text.length < 15) continue;

        const url = match[1] ? (match[1].startsWith('http') ? match[1] : new URL(match[1], source.baseUrl).href) : source.baseUrl;
        jobs.push({
          sourceUrl: url,
          org: 'Union Public Service Commission',
          title: text,
          postNames: [text],
          state: 'ALL_IN',
          category: 'GOVERNMENT',
        });
      }
    }
    return jobs;
  }

  private parseIBPS(html: string, source: any): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const pattern = /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*(?:PO|clerk|SO|recruitment|IBPS)[^<]*<\/a>/gi;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const text = this.cleanHtml(match[0]);
      if (text.length < 15) continue;
      const url = match[1].startsWith('http') ? match[1] : new URL(match[1], source.baseUrl).href;
      jobs.push({
        sourceUrl: url,
        org: 'Institute of Banking Personnel Selection',
        title: text,
        postNames: [text],
        state: 'ALL_IN',
        category: 'BANKING',
      });
    }
    return jobs;
  }

  private parseRRB(html: string, source: any): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const pattern = /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*(?:NTPC|ALP|group D|recruitment|RRB)[^<]*<\/a>/gi;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const text = this.cleanHtml(match[0]);
      if (text.length < 15) continue;
      const url = match[1].startsWith('http') ? match[1] : new URL(match[1], source.baseUrl).href;
      jobs.push({
        sourceUrl: url,
        org: 'Railway Recruitment Boards',
        title: text,
        postNames: [text],
        state: 'ALL_IN',
        category: 'RAILWAY',
      });
    }
    return jobs;
  }

  private parseRSS(html: string, source: any): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const titlePattern = /<title[^>]*>([\s\S]*?)<\/title>/i;
    const linkPattern = /<link[^>]*>([\s\S]*?)<\/link>/i;
    const descPattern = /<description[^>]*>([\s\S]*?)<\/description>/i;

    let itemMatch;
    while ((itemMatch = itemPattern.exec(html)) !== null) {
      const itemHtml = itemMatch[1];
      const titleMatch = titlePattern.exec(itemHtml);
      const linkMatch = linkPattern.exec(itemHtml);
      const descMatch = descPattern.exec(itemHtml);

      if (titleMatch) {
        const title = this.cleanHtml(titleMatch[1]);
        if (title.length < 10) continue;
        jobs.push({
          sourceUrl: linkMatch ? linkMatch[1].trim() : source.baseUrl,
          org: this.extractOrgFromTitle(title),
          title,
          postNames: [title],
          state: 'ALL_IN',
          category: 'GOVERNMENT',
          eligibilityCriteria: descMatch ? this.cleanHtml(descMatch[1]).substring(0, 500) : undefined,
        });
      }
    }
    return jobs;
  }

  private parseGeneric(html: string, source: any): CrawledJob[] {
    const jobs: CrawledJob[] = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const text = match[2].trim();
      if (text.length > 20 && /recruit|vacancy|examination|constable|inspector|clerk|officer|po\b|ibps|ssc|upsc|rrb/i.test(text)) {
        jobs.push({
          sourceUrl: url.startsWith('http') ? url : new URL(url, source.baseUrl).href,
          org: this.extractOrgFromTitle(text),
          title: text,
          postNames: [text],
          state: 'ALL_IN',
          category: 'GOVERNMENT',
        });
      }
    }
    return jobs;
  }

  private extractOrgFromTitle(title: string): string {
    const orgMap: Record<string, string> = {
      'SSC': 'Staff Selection Commission',
      'UPSC': 'Union Public Service Commission',
      'IBPS': 'Institute of Banking Personnel Selection',
      'RRB': 'Railway Recruitment Boards',
      'SBI': 'State Bank of India',
      'MPSC': 'Maharashtra Public Service Commission',
      'BPSC': 'Bihar Public Service Commission',
      'DRDO': 'Defence Research and Development Organisation',
      'ISRO': 'Indian Space Research Organisation',
      'ONGC': 'Oil and Natural Gas Corporation',
      'NTPC': 'National Thermal Power Corporation',
      'BSF': 'Border Security Force',
      'CRPF': 'Central Reserve Police Force',
      'CISF': 'Central Industrial Security Force',
      'ITBP': 'Indo-Tibetan Border Police',
      'CBI': 'Central Bureau of Investigation',
      'NTRO': 'National Technical Research Organisation',
      'BARC': 'Bhabha Atomic Research Centre',
      'IOCL': 'Indian Oil Corporation',
      'BEL': 'Bharat Electronics Limited',
      'HAL': 'Hindustan Aeronautics Limited',
      'NIA': 'National Investigation Agency',
      'NIOS': 'National Institute of Open Schooling',
      'ESIC': 'Employees State Insurance Corporation',
      'AIIMS': 'All India Institute of Medical Sciences',
      'KVS': 'Kendriya Vidyalaya Sangathan',
      'DSSSB': 'Delhi Subordinate Services Selection Board',
      'TNPSC': 'Tamil Nadu Public Service Commission',
      'KPSC': 'Karnataka Public Service Commission',
      'WBPSC': 'West Bengal Public Service Commission',
    };

    for (const [abbr, full] of Object.entries(orgMap)) {
      if (title.toUpperCase().includes(abbr)) return full;
    }
    return 'Government of India';
  }

  private cleanHtml(text: string): string {
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateFingerprint(job: CrawledJob): string {
    const data = `${job.org}|${job.title}|${job.sourceUrl}`.toLowerCase().replace(/\s+/g, ' ');
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private async upsertJob(job: CrawledJob, sourceId: string): Promise<'created' | 'updated'> {
    const fingerprint = this.generateFingerprint(job);
    const existing = await this.prisma.job.findUnique({ where: { fingerprint } });

    const data: Record<string, any> = {
      sourceId, sourceUrl: job.sourceUrl, org: job.org, title: job.title,
      postNames: JSON.stringify(job.postNames),
      totalVacancies: job.totalVacancies,
      state: job.state || 'ALL_IN',
      district: job.district,
      qualificationText: job.qualificationText,
      qualificationLevels: JSON.stringify(job.qualificationLevels || ['Graduate']),
      ageMin: job.ageMin, ageMax: job.ageMax,
      gender: job.gender,
      generalFee: job.generalFee, obcFee: job.obcFee, scStFee: job.scStFee,
      applyStart: job.applyStart, applyEnd: job.applyEnd,
      feePaymentEnd: job.feePaymentEnd,
      examDate: job.examDate,
      applyUrl: job.applyUrl,
      officialNotificationUrl: job.officialNotificationUrl,
      eligibilityCriteria: job.eligibilityCriteria,
      howToApply: job.howToApply,
      selectionProcess: job.selectionProcess,
      lastSeenAt: new Date(),
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
      await this.prisma.job.create({
        data: {
          fingerprint,
          org: job.org,
          title: job.title,
          status: 'OPEN',
          category: (job.category as 'GOVERNMENT' | 'SEMI_GOVERNMENT' | 'PSU' | 'BANKING' | 'RAILWAY' | 'DEFENCE' | 'POLICE' | 'TEACHING' | 'MEDICAL' | 'ENGINEERING' | 'IT' | 'PRIVATE' | 'INTERNSHIP' | 'TRAINING' | 'CONTRACT') || 'GOVERNMENT',
          ...data,
        },
      });
      return 'created';
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
