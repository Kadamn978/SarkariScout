import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { ChangesModule } from '../changes/changes.module';
import { EmailModule } from '../email/email.module';
import { AdaptiveSchedulerService } from './adaptive-scheduler.service';
import { JobDeletionDetectorService } from './job-deletion-detector.service';
import { RSSMonitorService } from './rss-monitor.service';
import { FakeSiteDetectorService } from './fake-site-detector.service';
import { CompetitorMonitorService } from './competitor-monitor.service';
import { CompetitorPipeline } from './agents/competitor-pipeline.service';
import { SourceManagerAgent } from './agents/source-manager.agent';
import { JobValidatorAgent } from './agents/job-validator.agent';

@Module({
  imports: [ChangesModule, EmailModule],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    AdaptiveSchedulerService,
    JobDeletionDetectorService,
    RSSMonitorService,
    FakeSiteDetectorService,
    CompetitorMonitorService,
    CompetitorPipeline,
    SourceManagerAgent,
    JobValidatorAgent,
  ],
  exports: [
    CrawlerService,
    AdaptiveSchedulerService,
    JobDeletionDetectorService,
    RSSMonitorService,
    FakeSiteDetectorService,
    CompetitorMonitorService,
    CompetitorPipeline,
  ],
})
export class CrawlerModule {}
