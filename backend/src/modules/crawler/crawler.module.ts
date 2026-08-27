import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { ChangesModule } from '../changes/changes.module';
import { AdaptiveSchedulerService } from './adaptive-scheduler.service';
import { JobDeletionDetectorService } from './job-deletion-detector.service';
import { RSSMonitorService } from './rss-monitor.service';
import { FakeSiteDetectorService } from './fake-site-detector.service';

@Module({
  imports: [ChangesModule],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    AdaptiveSchedulerService,
    JobDeletionDetectorService,
    RSSMonitorService,
    FakeSiteDetectorService,
  ],
  exports: [
    CrawlerService,
    AdaptiveSchedulerService,
    JobDeletionDetectorService,
    RSSMonitorService,
    FakeSiteDetectorService,
  ],
})
export class CrawlerModule {}
