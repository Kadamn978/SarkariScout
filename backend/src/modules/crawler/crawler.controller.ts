import { Controller, Post, Param, UseGuards, Get, Query } from '@nestjs/common';
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
  async crawlSource(@Param('sourceId') sourceId: string) {
    return this.crawlerService.crawlSource(sourceId);
  }

  @Post('crawl-all')
  @Roles('ADMIN')
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
    return this.crawlerService.getCrawlHistory(sourceId, limit ? parseInt(limit) : 20);
  }
}
