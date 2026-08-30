import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { validateUrl } from '../url-validator';
import { cleanHtml, extractOrgFromTitle } from '../shared-utils';
import { ResolvedJob } from './source-resolver.agent';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

export interface ScrapedOfficialJob {
  title: string;
  org: string;
  description: string;
  postNames: string[];
  vacancies: number | null;
  location: string;
  applyUrl: string;
  sourceUrl: string;
  officialDomain: string;
}

export class OfficialScraperAgent {
  private readonly logger = new Logger(OfficialScraperAgent.name);

  constructor(private prisma: PrismaService) {}

  async scrapeSourceJobs(resolvedJobs: ResolvedJob[]): Promise<ScrapedOfficialJob[]> {
    // Group by domain to avoid scraping same site multiple times
    const domainGroups = new Map<string, ResolvedJob[]>();
    for (const job of resolvedJobs) {
      if (!job.officialDomain || job.isAlreadyTracked) continue;
      const group = domainGroups.get(job.officialDomain) || [];
      group.push(job);
      domainGroups.set(job.officialDomain, group);
    }

    const allJobs: ScrapedOfficialJob[] = [];

    for (const [domain, jobs] of domainGroups) {
      try {
        const sourceUrl = jobs[0].officialUrl;
        this.logger.log(`Scraping official source: ${domain}`);

        const scraped = await this.scrapeOfficialPage(sourceUrl, domain);
        allJobs.push(...scraped);

        this.logger.log(`Found ${scraped.length} jobs from ${domain}`);
      } catch (e) {
        this.logger.error(`Failed to scrape ${domain}: ${(e as Error).message}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    }

    return allJobs;
  }

  async scrapeOfficialPage(url: string, domain: string): Promise<ScrapedOfficialJob[]> {
    const html = await this.fetchWithRetry(url);
    if (!html) return [];

    const jobs: ScrapedOfficialJob[] = [];
    const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];
      const text = cleanHtml(match[2]).trim();

      if (text.length < 15) continue;
      if (!this.isJobLink(text)) continue;

      let fullUrl: string;
      try {
        fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
      } catch {
        continue;
      }

      // Verify it's still on the official domain or links to known apply portals
      const linkDomain = this.extractDomain(fullUrl);
      if (!this.isValidApplyDomain(linkDomain, domain)) continue;

      const org = extractOrgFromTitle(text) || domain;
      const description = this.extractDescription(html, match.index);
      const vacancies = this.extractVacancies(text);
      const postNames = this.extractPostNames(text);

      jobs.push({
        title: text,
        org,
        description: description || text,
        postNames,
        vacancies,
        location: this.extractLocation(text, domain),
        applyUrl: fullUrl,
        sourceUrl: url,
        officialDomain: domain,
      });
    }

    // Deduplicate
    const seen = new Set<string>();
    return jobs.filter(j => {
      const key = j.title.toLowerCase().substring(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private isJobLink(text: string): boolean {
    const keywords = [
      /recruit/i, /vacanc/i, /examination/i, /constable/i, /inspector/i,
      /clerk/i, /officer/i, /\bpo\b/i, /notification/i, /apply/i,
      /online form/i, /last date/i, /group [a-d]/i, /grade [a-d]/i,
      /assistant/i, /engineer/i, /technician/i, /graduate/i,
    ];
    return keywords.some(kw => kw.test(text));
  }

  private isValidApplyDomain(linkDomain: string, sourceDomain: string): boolean {
    // Must be on official domain or known apply portals
    const validDomains = [
      sourceDomain,
      'ibpsonline.ibps.in',
      'ssc.gov.in',
      'upsconline.nic.in',
      'online.application',
      'apply',
    ];
    return validDomains.some(d => linkDomain.includes(d));
  }

  private extractDescription(html: string, index: number): string {
    const start = Math.max(0, index - 300);
    const end = Math.min(html.length, index + 500);
    const snippet = html.substring(start, end);
    const textOnly = snippet.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textOnly.substring(0, 500);
  }

  private extractVacancies(text: string): number | null {
    const match = text.match(/(\d[\d,]*)\s*(vacancy|vacancies|post|seat)/i);
    if (match) return parseInt(match[1].replace(/,/g, ''));
    return null;
  }

  private extractPostNames(text: string): string[] {
    // Extract post names from title like "SSC CGL Post 1, 2, 3"
    const match = text.match(/Post\s+(\d[\d,\s]*)/i);
    if (match) {
      return match[1].split(/[,\s]+/).filter(s => s.trim().length > 0);
    }
    return [text];
  }

  private extractLocation(text: string, domain: string): string {
    const stateMap: Record<string, string> = {
      'maharashtra': 'Maharashtra', 'rajasthan': 'Rajasthan',
      'uttar pradesh': 'Uttar Pradesh', 'bihar': 'Bihar',
      'karnataka': 'Karnataka', 'tamil nadu': 'Tamil Nadu',
    };
    for (const [key, val] of Object.entries(stateMap)) {
      if (text.toLowerCase().includes(key)) return val;
    }
    return 'All India';
  }

  private extractDomain(url: string): string {
    try { return new URL(url).hostname; } catch { return ''; }
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const validation = validateUrl(url);
        if (!validation.valid) return null;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(url, {
          headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html' },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          if (attempt < retries) await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        return await response.text();
      } catch (e) {
        if (attempt < retries) await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
    return null;
  }
}
