import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrawlerService, CrawledJob } from './crawler.service';
import { validateUrl, sanitizeError } from './url-validator';
import { cleanHtml, extractOrgFromTitle, sleep } from './shared-utils';

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

const MAX_SEEN_GUIDS = 10000;

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

    // Validate URL before fetching
    const urlCheck = validateUrl(feed.feedUrl);
    if (!urlCheck.valid) {
      errors.push(`Invalid RSS URL: ${urlCheck.reason}`);
      return { newItems, errors };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(feed.feedUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: controller.signal,
        redirect: 'manual',
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
          this.addSeenGuid(guid);
          newItems.push(item);
        }
      }

      this.logger.log(`RSS feed ${feed.sourceName}: ${items.length} items, ${newItems.length} new`);
    } catch (e) {
      const msg = sanitizeError(e);
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
          org: extractOrgFromTitle(item.title),
          title: item.title,
          postNames: [item.title],
          state: 'ALL_IN',
          category: 'GOVERNMENT',
          eligibilityCriteria: item.description ? item.description.substring(0, 500) : undefined,
          officialNotificationUrl: item.link,
        };

        await this.crawler.upsertFromCrawledJob(job, feed.sourceId);
        added++;
      } catch (e) {
        const msg = sanitizeError(e);
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

      await sleep(2000);
    }

    return results;
  }

  private addSeenGuid(guid: string): void {
    this.seenGuids.add(guid);
    // Evict oldest entries if over limit
    if (this.seenGuids.size > MAX_SEEN_GUIDS) {
      const iterator = this.seenGuids.values();
      for (let i = 0; i < 1000; i++) {
        this.seenGuids.delete(iterator.next().value!);
      }
    }
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
          title: cleanHtml(title),
          link: link || '',
          pubDate: pubDate ? new Date(pubDate) : null,
          description: description ? cleanHtml(description) : '',
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
}
