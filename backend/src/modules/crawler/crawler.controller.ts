import { Controller, Post, Param, UseGuards, Get, Query, Res, Logger } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CrawlerService } from './crawler.service'
import { CompetitorMonitorService } from './competitor-monitor.service'
import { CompetitorPipeline } from './agents/competitor-pipeline.service'
import { NotificationPdfService } from './notification-pdf.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { Response } from 'express'

@Controller('crawler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrawlerController {
  private readonly logger = new Logger(CrawlerController.name);
  constructor(
    private crawlerService: CrawlerService,
    private competitorMonitor: CompetitorMonitorService,
    private competitorPipeline: CompetitorPipeline,
    private notificationPdfService: NotificationPdfService,
  ) {}

  @Post('crawl/:sourceId')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async crawlSource(@Param('sourceId') sourceId: string) {
    try {
      return await this.crawlerService.crawlSource(sourceId);
    } catch (err) {
      this.logger.error(`Crawl failed: ${(err as Error).message}`);
      return { added: 0, updated: 0, errors: [(err as Error).message], duration: 0 };
    }
  }

  @Post('crawl-all')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async crawlAll() {
    try {
      return await this.crawlerService.crawlAll();
    } catch (err) {
      this.logger.error(`Crawl all failed: ${(err as Error).message}`);
      return {};
    }
  }

  @Post('competitor-pipeline')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 1, ttl: 600000 } })
  async runCompetitorPipeline() {
    try {
      return await this.competitorPipeline.run();
    } catch (err) {
      this.logger.error(`Competitor pipeline failed: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  }

  @Get('pipeline-stats')
  @Roles('ADMIN')
  async getPipelineStats() {
    try {
      return await this.competitorPipeline.getPipelineStats();
    } catch (err) {
      this.logger.error(`Pipeline stats failed: ${(err as Error).message}`);
      return { sources: [], total: 0 };
    }
  }

  @Post('discover-sources')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async discoverOfficialSources() {
    try {
      return await this.competitorMonitor.discoverOfficialSources();
    } catch (err) {
      this.logger.error(`Source discovery failed: ${(err as Error).message}`);
      return { discovered: 0, error: (err as Error).message };
    }
  }

  @Get('discovered-sources')
  @Roles('ADMIN')
  async getDiscoveredSources() {
    try {
      return await this.competitorMonitor.getDiscoveredSourcesSummary();
    } catch (err) {
      this.logger.error(`Discovered sources failed: ${(err as Error).message}`);
      return { sources: [], total: 0 };
    }
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    try {
      return await this.crawlerService.getSourceStats();
    } catch (err) {
      this.logger.error(`Crawler stats failed: ${(err as Error).message}`);
      return [];
    }
  }

  @Get('history/:sourceId')
  @Roles('ADMIN')
  async getHistory(@Param('sourceId') sourceId: string, @Query('limit') limit?: string) {
    try {
      const parsed = parseInt(limit || '20')
      const safeLimit = isNaN(parsed) ? 20 : Math.min(Math.max(parsed, 1), 100)
      return await this.crawlerService.getCrawlHistory(sourceId, safeLimit)
    } catch (err) {
      this.logger.error(`Crawl history failed: ${(err as Error).message}`);
      return [];
    }
  }

  @Post('rescrape/:jobId')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async rescrapeJob(@Param('jobId') jobId: string) {
    try {
      return await this.notificationPdfService.rescrapeJob(jobId)
    } catch (err) {
      this.logger.error(`Rescrape failed: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  }

  @Get('notification/:jobId')
  async getNotification(@Param('jobId') jobId: string) {
    try {
      const notification = await this.notificationPdfService.getNotificationForJob(jobId)
      return notification || { message: 'No notification available for this job' }
    } catch (err) {
      this.logger.error(`Notification lookup failed: ${(err as Error).message}`);
      return { message: 'No notification available for this job' }
    }
  }

  @Get('notification-pdf/:notificationId')
  async getPdf(@Param('notificationId') notificationId: string, @Res() res: Response) {
    try {
      const pdf = await this.notificationPdfService.getPdfData(notificationId)
      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found or has been purged after 90 days' })
      }
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdf.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      })
      return res.send(pdf)
    } catch (err) {
      this.logger.error(`PDF download failed: ${(err as Error).message}`);
      return res.status(500).json({ error: 'Failed to retrieve PDF' })
    }
  }
}
