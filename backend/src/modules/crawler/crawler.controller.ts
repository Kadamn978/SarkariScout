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

  @Post('monitor-competitors')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 2, ttl: 300000 } })
  async monitorCompetitors() {
    return this.competitorMonitor.monitorAll();
  }

  @Post('monitor-competitor/:sourceId')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async monitorCompetitor(@Param('sourceId') sourceId: string) {
    const source = await this.crawlerService['prisma'].source.findUnique({ where: { id: sourceId } });
    if (!source) return { error: 'Source not found' };
    return this.competitorMonitor.monitorSite(sourceId, source.baseUrl, source.name);
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    return this.crawlerService.getSourceStats();
  }

  @Get('competitor-stats')
  @Roles('ADMIN')
  async getCompetitorStats() {
    return this.competitorMonitor.getCompetitorStats();
  }

  @Get('history/:sourceId')
  @Roles('ADMIN')
  async getHistory(@Param('sourceId') sourceId: string, @Query('limit') limit?: string) {
    const parsed = parseInt(limit || '20');
    const safeLimit = isNaN(parsed) ? 20 : Math.min(Math.max(parsed, 1), 100);
    return this.crawlerService.getCrawlHistory(sourceId, safeLimit);
  }
}
