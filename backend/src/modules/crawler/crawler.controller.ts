import { Controller, Post, Param, UseGuards, Get, Query, Res } from '@nestjs/common'
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
    return this.crawlerService.crawlSource(sourceId)
  }

  @Post('crawl-all')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async crawlAll() {
    return this.crawlerService.crawlAll()
  }

  @Post('competitor-pipeline')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 1, ttl: 600000 } })
  async runCompetitorPipeline() {
    return this.competitorPipeline.run()
  }

  @Get('pipeline-stats')
  @Roles('ADMIN')
  async getPipelineStats() {
    return this.competitorPipeline.getPipelineStats()
  }

  @Post('discover-sources')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async discoverOfficialSources() {
    return this.competitorMonitor.discoverOfficialSources()
  }

  @Get('discovered-sources')
  @Roles('ADMIN')
  async getDiscoveredSources() {
    return this.competitorMonitor.getDiscoveredSourcesSummary()
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    return this.crawlerService.getSourceStats()
  }

  @Get('history/:sourceId')
  @Roles('ADMIN')
  async getHistory(@Param('sourceId') sourceId: string, @Query('limit') limit?: string) {
    const parsed = parseInt(limit || '20')
    const safeLimit = isNaN(parsed) ? 20 : Math.min(Math.max(parsed, 1), 100)
    return this.crawlerService.getCrawlHistory(sourceId, safeLimit)
  }

  @Post('rescrape/:jobId')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async rescrapeJob(@Param('jobId') jobId: string) {
    return this.notificationPdfService.rescrapeJob(jobId)
  }

  @Get('notification/:jobId')
  async getNotification(@Param('jobId') jobId: string) {
    return this.notificationPdfService.getNotificationForJob(jobId)
  }

  @Get('notification-pdf/:notificationId')
  async getPdf(@Param('notificationId') notificationId: string, @Res() res: Response) {
    const pdf = await this.notificationPdfService.getPdfData(notificationId)
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found or has been purged' })
    }
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length.toString(),
      'Cache-Control': 'public, max-age=86400',
    })
    return res.send(pdf)
  }
}
