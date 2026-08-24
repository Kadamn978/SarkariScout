import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CronService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CronService.name);
  private intervals: NodeJS.Timeout[] = [];

  constructor(
    private crawler: CrawlerService,
    private email: EmailService,
  ) {}

  onModuleInit() {
    this.intervals.push(
      setInterval(() => this.runCrawler(), 6 * 60 * 60 * 1000),
    );
    this.intervals.push(
      setInterval(() => this.checkDigestTime(), 60 * 1000),
    );
    this.logger.log('CronService initialized — crawler every 6h, digest check every minute');
  }

  onModuleDestroy() {
    this.intervals.forEach(clearInterval);
  }

  private async runCrawler() {
    const istNow = this.getIST();
    this.logger.log(`Scheduled crawler run starting at IST ${istNow.toISOString()}`);
    try {
      const result = await this.crawler.crawlAll();
      const summary = Object.entries(result).map(([id, r]: [string, any]) =>
        `${id}: +${r.added}/~${r.updated} (${r.errors?.length || 0} errors)`
      ).join(', ');
      this.logger.log(`Crawler completed: ${summary}`);
    } catch (err) {
      this.logger.error(`Crawler failed: ${(err as Error).message}`);
    }
  }

  private async checkDigestTime() {
    const ist = this.getIST();
    if (ist.getHours() === 9 && ist.getMinutes() === 5) {
      this.logger.log('Triggering daily digest (IST 9:05 AM)');
      try {
        const result = await this.email.sendDailyDigest();
        this.logger.log(`Daily digest sent: ${result.sent}/${result.total}`);
      } catch (err) {
        this.logger.error(`Daily digest failed: ${(err as Error).message}`);
      }
    }
  }

  private getIST(): Date {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcMs + 5.5 * 60 * 60 * 1000);
  }
}
