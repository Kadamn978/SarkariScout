import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AnalyticsService } from './analytics.service'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { TrackEventDto } from './dto/track-event.dto'

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async track(
    @Body() dto: TrackEventDto,
    @Req() req: Request,
  ) {
    return this.analyticsService.trackPageView({
      path: dto.path,
      userAgent: dto.userAgent || req.headers['user-agent'],
      referrer: dto.referrer || req.headers.referer,
    })
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getDashboard(@Query('days') days?: string) {
    return this.analyticsService.getDashboardStats(days ? parseInt(days) : 7)
  }

  @Get('page')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getPageStats(@Query('path') path: string, @Query('days') days?: string) {
    return this.analyticsService.getPageStats(path, days ? parseInt(days) : 30)
  }
}
