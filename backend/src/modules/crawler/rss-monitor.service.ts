import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrawlerService, CrawledJob } from './crawler.service';

export interface RSSFeed {
  sourceId: string;
  sourceName: string;
  feedUrl: string;
  officialUrl: string;
  lastChecked: Date | null;
  lastItemCount: number;
  newItems: number;
}

export interface RSSItem {
  title: string;
  link: string;
  pubDate: Date | null;
  description: string;
  guid: string;
}

@Injectable()
export class RSSMonitorService {
  private readonly logger = new Logger(RSSMonitorService.name);
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
  private readonly seenGuids: Set<string> = new Set();

  constructor(
    private prisma: PrismaService,
    private crawler: CrawlerService,
  ) {}

  async getRSSFeeds(): Promise<RSSFeed[]> {
    const sources = await this.prisma.source.findMany({
      where: { enabled: true },
    });

    return sources
      .filter((s) => {
        const config = s.configJson ? JSON.parse(s.configJson) : {};
        return s.type === 'RSS' || config.rssUrl || this.hasRSSFeed(s.baseUrl);
      })
      .map((s) => {
        const config = s.configJson ? JSON.parse(s.configJson) : {};
        return {
          sourceId: s.id,
          sourceName: s.name,
          feedUrl: config.rssUrl || `${s.baseUrl}/rss`,
          officialUrl: s.baseUrl,
          lastChecked: s.lastRunAt,
          lastItemCount: s.itemsPerRun,
          newItems: 0,
        };
      });
  }

  async checkFeed(feed: RSSFeed): Promise<{ newItems: RSSItem[]; errors: string[] }> {
    this.logger.log(`Checking RSS feed: ${feed.sourceName} (${feed.feedUrl})`);
    const errors: string[] = [];
    const newItems: RSSItem[] = [];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(feed.feedUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        errors.push(`HTTP ${res.status}`);
        return { newItems, errors };
      }

      const xml = await res.text();
      const items = this.parseRSSXML(xml);

      for (const item of items) {
        const guid = item.guid || item.link || item.title;
        if (!this.seenGuids.has(guid)) {
          this.seenGuids.add(guid);
          newItems.push(item);
        }
      }

      this.logger.log(`RSS feed ${feed.sourceName}: ${items.length} items, ${newItems.length} new`);
    } catch (e) {
      const msg = (e as Error).message;
      errors.push(msg);
      this.logger.warn(`RSS feed ${feed.sourceName} failed: ${msg}`);
    }

    return { newItems, errors };
  }

  async processNewItems(feed: RSSFeed, items: RSSItem[]): Promise<{ added: number; errors: string[] }> {
    let added = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        const job: CrawledJob = {
          sourceUrl: item.link || feed.officialUrl,
          org: this.extractOrgFromTitle(item.title),
          title: item.title,
          postNames: [item.title],
          state: 'ALL_IN',
          category: 'GOVERNMENT',
          eligibilityCriteria: item.description ? item.description.substring(0, 500) : undefined,
          officialNotificationUrl: item.link,
        };

        // Use the crawler's upsert logic
        await (this.crawler as any).upsertJob(job, feed.sourceId);
        added++;
      } catch (e) {
        const msg = (e as Error).message;
        if (!errors.includes(msg)) errors.push(msg);
      }
    }

    return { added, errors };
  }

  async monitorAllFeeds(): Promise<{ feed: string; newItems: number; added: number; errors: string[] }[]> {
    const feeds = await this.getRSSFeeds();
    const results: { feed: string; newItems: number; added: number; errors: string[] }[] = [];

    for (const feed of feeds) {
      const { newItems, errors } = await this.checkFeed(feed);

      if (newItems.length > 0) {
        const { added, errors: addErrors } = await this.processNewItems(feed, newItems);
        errors.push(...addErrors);
        results.push({ feed: feed.sourceName, newItems: newItems.length, added, errors });
      } else {
        results.push({ feed: feed.sourceName, newItems: 0, added: 0, errors });
      }

      await this.sleep(2000);
    }

    return results;
  }

  private parseRSSXML(xml: string): RSSItem[] {
    const items: RSSItem[] = [];
    const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemPattern.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = this.extractTag(itemXml, 'title');
      const link = this.extractTag(itemXml, 'link');
      const pubDate = this.extractTag(itemXml, 'pubDate');
      const description = this.extractTag(itemXml, 'description');
      const guid = this.extractTag(itemXml, 'guid');

      if (title) {
        items.push({
          title: this.cleanHtml(title),
          link: link || '',
          pubDate: pubDate ? new Date(pubDate) : null,
          description: description ? this.cleanHtml(description) : '',
          guid: guid || link || title,
        });
      }
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string | null {
    const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = pattern.exec(xml);
    return match ? match[1].trim() : null;
  }

  private hasRSSFeed(baseUrl: string): boolean {
    const rssDomains = ['employmentnews.gov.in', 'ssc.gov.in', 'upsc.gov.in'];
    return rssDomains.some((d) => baseUrl.includes(d));
  }

  private extractOrgFromTitle(title: string): string {
    const orgMap: Record<string, string> = {
      'SSC': 'Staff Selection Commission',
      'UPSC': 'Union Public Service Commission',
      'IBPS': 'Institute of Banking Personnel Selection',
      'RRB': 'Railway Recruitment Boards',
      'SBI': 'State Bank of India',
      'DRDO': 'Defence Research and Development Organisation',
      'ISRO': 'Indian Space Research Organisation',
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

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
