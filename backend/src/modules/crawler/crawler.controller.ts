import { Controller, Post, Param, UseGuards, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CrawlerService } from './crawler.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('crawler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrawlerController {
  constructor(private crawlerService: CrawlerService) {}

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
