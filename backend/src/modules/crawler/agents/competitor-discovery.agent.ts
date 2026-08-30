import { Logger } from '@nestjs/common';
import { validateUrl } from '../url-validator';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

export interface CompetitorJob {
  title: string;
  url: string;
  org: string;
  dateText: string;
  siteName: string;
  siteUrl: string;
}

export class CompetitorDiscoveryAgent {
  private readonly logger = new Logger(CompetitorDiscoveryAgent.name);

  private readonly COMPETITOR_SITES = [
    { name: 'SarkariResult', url: 'https://www.sarkariresult.com/latestjob/' },
    { name: 'FreeJobAlert', url: 'https://www.freejobalert.com/government-jobs/' },
    { name: 'FreshersLive', url: 'https://www.fresherslive.com/government-jobs' },
    { name: 'JagranJosh', url: 'https://www.jagranjosh.com/government-jobs' },
  ];

  async discoverAll(): Promise<CompetitorJob[]> {
    const allJobs: CompetitorJob[] = [];

    for (const site of this.COMPETITOR_SITES) {
      try {
        const jobs = await this.scrapeSite(site.name, site.url);
        allJobs.push(...jobs);
        this.logger.log(`Found ${jobs.length} jobs from ${site.name}`);
      } catch (e) {
        this.logger.error(`Failed to scrape ${site.name}: ${(e as Error).message}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    }

    this.logger.log(`Total competitor jobs discovered: ${allJobs.length}`);
    return allJobs;
  }

  async scrapeSite(siteName: string, url: string): Promise<CompetitorJob[]> {
    const html = await this.fetchWithRetry(url);
    if (!html) return [];

    const jobs: CompetitorJob[] = [];
    const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];
      const text = this.cleanHtml(match[2]).trim();

      if (text.length < 15) continue;
      if (!this.isJobRelated(text)) continue;

      let fullUrl: string;
      try {
        fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
      } catch {
        continue;
      }

      if (this.isNavigationLink(fullUrl)) continue;

      const dateNearby = this.extractDateNearMatch(html, match.index);
      const year = this.extractYear(text) || this.extractYear(dateNearby) || this.extractYear(fullUrl);

      // Only jobs from last 2 years
      const currentYear = new Date().getFullYear();
      if (year && year < currentYear - 1) continue;

      const org = this.extractOrg(text);
      const state = this.extractState(text, fullUrl);

      jobs.push({
        title: text,
        url: fullUrl,
        org,
        dateText: dateNearby,
        siteName,
        siteUrl: url,
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

  private isJobRelated(text: string): boolean {
    const keywords = [
      /recruit/i, /vacanc/i, /examination/i, /constable/i, /inspector/i,
      /clerk/i, /officer/i, /\bpo\b/i, /ibps/i, /ssc/i, /upsc/i, /rrb/i,
      /notification/i, /apply/i, /online form/i, /last date/i,
      /group [a-d]/i, /grade [a-d]/i, /level \d/i,
      /sarkari/i, /naukri/i, /government/i, /psu/i, /bank/i,
      /assistant/i, /engineer/i, /technician/i, /graduate/i,
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

  private extractDateNearMatch(html: string, index: number): string {
    const start = Math.max(0, index - 200);
    const end = Math.min(html.length, index + 500);
    const snippet = html.substring(start, end);
    const dateMatch = snippet.match(/\d{1,2}[\s.\/-]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.\/-]+20\d{2}/i);
    return dateMatch ? dateMatch[0] : '';
  }

  private extractYear(text: string): number | null {
    const match = text.match(/\b(20\d{2})\b/);
    return match ? parseInt(match[1]) : null;
  }

  private extractOrg(text: string): string {
    const orgPatterns: [RegExp, string][] = [
      [/staff selection commission/i, 'SSC'],
      [/upsc/i, 'UPSC'],
      [/ibps/i, 'IBPS'],
      [/rrb/i, 'RRB'],
      [/mpsc/i, 'MPSC'],
      [/sbi/i, 'SBI'],
      [/lic/i, 'LIC'],
      [/rpsc/i, 'RPSC'],
      [/uppsc/i, 'UPPSC'],
      [/bssc/i, 'BSSC'],
      [/upsssc/i, 'UPSSSC'],
      [/drdo/i, 'DRDO'],
      [/isro/i, 'ISRO'],
      [/barc/i, 'BARC'],
      [/ongc/i, 'ONGC'],
      [/iocl/i, 'IOCL'],
      [/nhai/i, 'NHAI'],
      [/indian army/i, 'Indian Army'],
      [/indian navy/i, 'Indian Navy'],
      [/indian air force/i, 'Indian Air Force'],
      [/crpf/i, 'CRPF'],
      [/bsf/i, 'BSF'],
      [/cisf/i, 'CISF'],
      [/itbp/i, 'ITBP'],
      [/ntpc/i, 'NTPC'],
      [/bhel/i, 'BHEL'],
      [/sail/i, 'SAIL'],
      [/ircon/i, 'IRCON'],
      [/rites/i, 'RITES'],
      [/nabard/i, 'NABARD'],
      [/gic/i, 'GIC'],
      [/niacl/i, 'NIACL'],
      [/oicl/i, 'OICL'],
      [/uiic/i, 'UIIC'],
      [/nicl/i, 'NICL'],
      [/ecgc/i, 'ECGC'],
      [/irdai/i, 'IRDAI'],
    ];

    for (const [pattern, name] of orgPatterns) {
      if (pattern.test(text)) return name;
    }

    const words = text.split(/\s+/);
    return words.length >= 3 ? words.slice(0, 3).join(' ') : words[0] || '';
  }

  private extractState(text: string, url: string): string {
    const stateMap: Record<string, string> = {
      'maharashtra': 'MAHARASHTRA', 'mumbai': 'MAHARASHTRA',
      'punjab': 'PUNJAB', 'haryana': 'HARYANA',
      'karnataka': 'KARNATAKA', 'kerala': 'KERALA',
      'tamil nadu': 'TAMIL_NADU', 'tamilnadu': 'TAMIL_NADU',
      'uttar pradesh': 'UTTAR_PRADESH', 'uppsc': 'UTTAR_PRADESH',
      'rajasthan': 'RAJASTHAN', 'rpsc': 'RAJASTHAN',
      'bihar': 'BIHAR', 'bssc': 'BIHAR',
      'west bengal': 'WEST_BENGAL', 'wbpsc': 'WEST_BENGAL',
      'gujarat': 'GUJARAT', 'telangana': 'TELANGANA',
      'andhra pradesh': 'ANDHRA_PRADESH', 'odisha': 'ODISHA',
      'jharkhand': 'JHARKHAND', 'chhattisgarh': 'CHHATTISGARH',
      'madhya pradesh': 'MADHYA_PRADESH', 'himachal pradesh': 'HIMACHAL_PRADESH',
    };
    const combined = `${text} ${url}`.toLowerCase();
    for (const [key, state] of Object.entries(stateMap)) {
      if (combined.includes(key)) return state;
    }
    return 'ALL_IN';
  }

  private cleanHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();
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
