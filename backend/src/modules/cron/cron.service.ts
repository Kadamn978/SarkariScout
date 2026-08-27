import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { EmailService } from '../email/email.service';
import { AdaptiveSchedulerService } from '../crawler/adaptive-scheduler.service';
import { JobDeletionDetectorService } from '../crawler/job-deletion-detector.service';
import { RSSMonitorService } from '../crawler/rss-monitor.service';

@Injectable()
export class CronService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CronService.name);
  private intervals: NodeJS.Timeout[] = [];
  private adaptiveLoopRunning = false;

  constructor(
    private crawler: CrawlerService,
    private email: EmailService,
    private adaptiveScheduler: AdaptiveSchedulerService,
    private deletionDetector: JobDeletionDetectorService,
    private rssMonitor: RSSMonitorService,
  ) {}

  onModuleInit() {
    // Adaptive crawler — runs every 5 minutes, checks which sources need crawling
    this.intervals.push(
      setInterval(() => this.runAdaptiveCrawler(), 5 * 60 * 1000),
    );

    // RSS monitor — checks every 30 minutes for new items
    this.intervals.push(
      setInterval(() => this.runRSSMonitor(), 30 * 60 * 1000),
    );

    // Deletion detector — runs every 6 hours
    this.intervals.push(
      setInterval(() => this.runDeletionCheck(), 6 * 60 * 60 * 1000),
    );

    // Digest check — every minute
    this.intervals.push(
      setInterval(() => this.checkDigestTime(), 60 * 1000),
    );

    // Initial runs
    setTimeout(() => this.runAdaptiveCrawler(), 10000);
    setTimeout(() => this.runRSSMonitor(), 30000);

    this.logger.log(
      'CronService initialized — adaptive crawler (5min check), RSS monitor (30min), deletion check (6h), digest (1min)',
    );
  }

  onModuleDestroy() {
    this.intervals.forEach(clearInterval);
  }

  private async runAdaptiveCrawler() {
    if (this.adaptiveLoopRunning) return;
    this.adaptiveLoopRunning = true;

    try {
      const sources = await this.crawler['prisma'].source.findMany({ where: { enabled: true } });
      const sourcesToCrawl = sources.filter((s: any) => this.adaptiveScheduler.shouldCrawl(s.id));

      if (sourcesToCrawl.length === 0) {
        this.adaptiveLoopRunning = false;
        return;
      }

      const window = this.adaptiveScheduler.getCurrentWindow();
      this.logger.log(
        `Adaptive crawl: ${sourcesToCrawl.length}/${sources.length} sources due (${window.label} window, ${window.intervalMs / 60000}min interval)`,
      );

      for (const source of sourcesToCrawl) {
        try {
          await this.crawler.crawlSource(source.id);
          this.adaptiveScheduler.markCrawled(source.id);
        } catch (err) {
          this.logger.error(`Crawl failed for ${source.name}: ${(err as Error).message}`);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      this.logger.error(`Adaptive crawler failed: ${(err as Error).message}`);
    } finally {
      this.adaptiveLoopRunning = false;
    }
  }

  private async runRSSMonitor() {
    try {
      const results = await this.rssMonitor.monitorAllFeeds();
      const withNew = results.filter((r) => r.newItems > 0);
      if (withNew.length > 0) {
        this.logger.log(
          `RSS monitor: ${withNew.map((r) => `${r.feed} +${r.added}`).join(', ')}`,
        );
      }
    } catch (err) {
      this.logger.error(`RSS monitor failed: ${(err as Error).message}`);
    }
  }

  private async runDeletionCheck() {
    try {
      this.logger.log('Running job deletion check...');
      const results = await this.deletionDetector.runFullDeletionCheck();
      const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
      if (totalDeleted > 0) {
        this.logger.warn(`Deletion check: ${totalDeleted} jobs removed from official sites`);
      } else {
        this.logger.log(`Deletion check: all ${results.reduce((sum, r) => sum + r.stillAlive, 0)} jobs still alive`);
      }
    } catch (err) {
      this.logger.error(`Deletion check failed: ${(err as Error).message}`);
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
