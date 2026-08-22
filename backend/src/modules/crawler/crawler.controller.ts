import { Controller, Post, Param, UseGuards, Get } from '@nestjs/common';
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

  @Get('status')
  @Roles('ADMIN')
  async getStatus() {
    const sources = await this.crawlerService['prisma'].source.findMany();
    return sources.map((s: any) => ({
      id: s.id, name: s.name, type: s.type, enabled: s.enabled,
      lastRunAt: s.lastRunAt, lastRunStatus: s.lastRunStatus, itemsPerRun: s.itemsPerRun,
    }));
  }
}
