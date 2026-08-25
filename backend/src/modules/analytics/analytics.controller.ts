import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Request } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  async track(@Body() body: { path: string; visitorId?: string; sessionId?: string }, @Req() req: Request) {
    return this.analyticsService.trackPageView({
      path: body.path,
      visitorId: body.visitorId,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
      sessionId: body.sessionId,
    });
  }

  @Get('dashboard')
  async getDashboard(@Query('days') days?: string) {
    return this.analyticsService.getDashboardStats(days ? parseInt(days) : 7);
  }

  @Get('page')
  async getPageStats(@Query('path') path: string, @Query('days') days?: string) {
    return this.analyticsService.getPageStats(path, days ? parseInt(days) : 30);
  }
}
