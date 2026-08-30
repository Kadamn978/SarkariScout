import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { validateUrl, sanitizeError } from './url-validator';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

@Injectable()
export class CompetitorMonitorService {
  private readonly logger = new Logger(CompetitorMonitorService.name);

  // Known official government domains to look for
  private readonly OFFICIAL_DOMAINS = [
    'gov.in', 'nic.in', 'nic.in', 'ssc.gov.in', 'upsc.gov.in',
    'ibps.in', 'ibpsonline.ibps.in', 'rbi.org.in',
    'licindia.in', 'sbi.co.in', 'bankofbaroda.in',
    'gicre.in', 'newindia.co.in', 'orientalinsurance.org.in',
    'uiic.co.in', 'nationalinsurance.nic.co.in', 'ecgc.in',
    'irdai.gov.in', 'mpsc.gov.in', 'maharashtra.gov.in',
    'mumbai.gov.in', 'ncog.gov.in',
    'dsorder.com', 'ssc.nic.in', 'uppsc.up.nic.in',
    'rpsc.rajasthan.gov.in', 'upsssc.gov.in',
    'bpsc.bih.nic.in', 'mgp.gov.in',
    'results.gov.in', 'nta.ac.in',
    'crpf.gov.in', 'bsf.gov.in', 'cisf.gov.in', 'itbp.gov.in',
    'indiapost.gov.in', 'indiapostgdsonline.gov.in',
    'nhai.gov.in', 'ntpc.com', 'bhel.in', 'sail.co.in',
    'ircon.org', 'rites.com', 'onGC.co.in',
    'drdo.gov.in', 'isro.gov.in', 'barc.gov.in',
    'cbse.gov.in', 'kvs.gov.in', 'nvs.edu.in',
    'aiims.gov.in', 'mohfw.gov.in',
    'employmentnews.gov.in',
  ];

  // Known aggregator patterns to skip
  private readonly AGGREGATOR_PATTERNS = [
    /sarkariresult\.com/i, /freejobalert\.com/i,
    /fresherslive\.com/i, /jagranjosh\.com/i,
    /adda247\.com/i, /oliveboard\.com/i,
    /prepp\.in/i, /gradeup\.in/i,
    /testbook\.com/i, /practice Mock\.in/i,
    /youtube\.com/i, /facebook\.com/i,
    /telegram\.me/i, /t\.me/i,
  ];

  constructor(private prisma: PrismaService) {}

  async discoverOfficialSources(): Promise<{
    discovered: { url: string; name: string; source: string }[];
    alreadyTracked: number;
    newDomains: string[];
  }> {
    const competitors = await this.prisma.source.findMany({
      where: { enabled: true, configJson: { contains: '"isCompetitor":true' } },
    });

    const allLinks = new Map<string, { url: string; name: string; source: string }>();
    let alreadyTracked = 0;

    for (const comp of competitors) {
      try {
        const links = await this.extractOfficialLinks(comp.baseUrl, comp.name);
        for (const link of links) {
          const domain = this.extractDomain(link.url);
          const existing = await this.prisma.source.findFirst({
            where: { baseUrl: { contains: domain } },
          });
          if (existing) {
            alreadyTracked++;
            continue;
          }
          if (!allLinks.has(link.url)) {
            allLinks.set(link.url, link);
          }
        }
      } catch (e) {
        this.logger.error(`Failed to scan ${comp.name}: ${(e as Error).message}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    }

    const discovered = Array.from(allLinks.values());
    const newDomains = [...new Set(discovered.map(d => this.extractDomain(d.url)))];

    this.logger.log(`Discovered ${discovered.length} official links, ${newDomains.length} new domains, ${alreadyTracked} already tracked`);

    return { discovered, alreadyTracked, newDomains };
  }

  private async extractOfficialLinks(url: string, siteName: string): Promise<{ url: string; name: string; source: string }[]> {
    const html = await this.fetchWithRetry(url);
    if (!html) return [];

    const links: { url: string; name: string; source: string }[] = [];
    const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];
      const text = this.cleanHtml(match[2]).trim();

      if (text.length < 10) continue;

      let fullUrl: string;
      try {
        fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
      } catch {
        continue;
      }

      // Skip aggregator sites
      if (this.AGGREGATOR_PATTERNS.some(p => p.test(fullUrl))) continue;

      // Check if it links to an official government domain
      const domain = this.extractDomain(fullUrl);
      const isOfficial = this.OFFICIAL_DOMAINS.some(od => domain.endsWith(od) || domain.includes(od));

      if (isOfficial) {
        links.push({ url: fullUrl, name: text, source: siteName });
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    return links.filter(l => {
      if (seen.has(l.url)) return false;
      seen.add(l.url);
      return true;
    });
  }

  async getDiscoveredSourcesSummary() {
    const competitors = await this.prisma.source.findMany({
      where: { configJson: { contains: '"isCompetitor":true' } },
      select: { id: true, name: true, baseUrl: true, lastRunAt: true },
    });

    const trackedOfficial = await this.prisma.source.count({
      where: { configJson: { notContains: '"isCompetitor":true' } },
    });

    return {
      competitors: competitors.length,
      officialSources: trackedOfficial,
      competitorList: competitors,
    };
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  private cleanHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '')
      .replace(/\s+/g, ' ')
      .trim();
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
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 2000 * attempt));
            continue;
          }
          return null;
        }

        return await response.text();
      } catch (e) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
    }
    return null;
  }
}
