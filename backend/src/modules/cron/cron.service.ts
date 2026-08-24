import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  private intervals: NodeJS.Timeout[] = [];

  constructor(
    private crawler: CrawlerService,
    private email: EmailService,
  ) {}

  onModuleInit() {
    // Run crawlers every 6 hours
    this.intervals.push(
      setInterval(() => this.runCrawler(), 6 * 60 * 60 * 1000),
    );

    // Run daily digest at 9:00 AM (check every minute)
    this.intervals.push(
      setInterval(() => this.checkDigestTime(), 60 * 1000),
    );

    this.logger.log('CronService initialized — crawler every 6h, digest check every minute');
  }

  onModuleDestroy() {
    this.intervals.forEach(clearInterval);
  }

  private async runCrawler() {
    this.logger.log('Scheduled crawler run starting');
    try {
      const result = await this.crawler.crawlAll();
      this.logger.log(`Crawler completed: ${JSON.stringify(result)}`);
    } catch (err) {
      this.logger.error(`Crawler failed: ${(err as Error).message}`);
    }
  }

  private async checkDigestTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Send digest at 9:00 AM IST (check for 9:05 AM to avoid duplicate runs)
    if (hours === 9 && minutes === 5) {
      this.logger.log('Triggering daily digest');
      try {
        const result = await this.email.sendDailyDigest();
        this.logger.log(`Daily digest sent: ${result.sent}/${result.total}`);
      } catch (err) {
        this.logger.error(`Daily digest failed: ${(err as Error).message}`);
      }
    }
  }
}
