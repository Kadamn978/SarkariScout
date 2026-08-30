import { Controller, Post, Param, UseGuards, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CrawlerService } from './crawler.service';
import { CompetitorMonitorService } from './competitor-monitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('crawler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrawlerController {
  constructor(
    private crawlerService: CrawlerService,
    private competitorMonitor: CompetitorMonitorService,
  ) {}

  @Post('crawl/:sourceId')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async crawlSource(@Param('sourceId') sourceId: string) {
    return this.crawlerService.crawlSource(sourceId);
  }

  @Post('crawl-all')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async crawlAll() {
    return this.crawlerService.crawlAll();
  }

  @Post('discover-sources')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async discoverOfficialSources() {
    return this.competitorMonitor.discoverOfficialSources();
  }

  @Get('discovered-sources')
  @Roles('ADMIN')
  async getDiscoveredSources() {
    return this.competitorMonitor.getDiscoveredSourcesSummary();
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    return this.crawlerService.getSourceStats();
  }

  @Get('history/:sourceId')
  @Roles('ADMIN')
  async getHistory(@Param('sourceId') sourceId: string, @Query('limit') limit?: string) {
    const parsed = parseInt(limit || '20');
    const safeLimit = isNaN(parsed) ? 20 : Math.min(Math.max(parsed, 1), 100);
    return this.crawlerService.getCrawlHistory(sourceId, safeLimit);
  }
}
