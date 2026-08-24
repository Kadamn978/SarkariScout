import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Req, Body } from '@nestjs/common';
import { Request } from 'express';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  async findAll(
    @Query('state') state?: string,
    @Query('category') category?: string,
    @Query('examFamily') examFamily?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobsService.findAll({
      state, category, examFamily, status, search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('upcoming')
  async getUpcoming(@Query('days') days?: string) {
    return this.jobsService.getUpcomingDeadlines(days ? parseInt(days) : 7);
  }

  @Get('recent')
  async getRecent(@Query('limit') limit?: string) {
    return this.jobsService.getRecentJobs(limit ? parseInt(limit) : 20);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post(':id/track')
  @UseGuards(JwtAuthGuard)
  async trackJob(
    @Req() req: Request,
    @Param('id') jobId: string,
    @Body('stage') stage?: string,
  ) {
    return this.jobsService.trackJob((req as any).user.sub, jobId, stage);
  }

  @Delete(':id/track')
  @UseGuards(JwtAuthGuard)
  async untrackJob(@Req() req: Request, @Param('id') jobId: string) {
    return this.jobsService.untrackJob((req as any).user.sub, jobId);
  }

  @Put(':id/tracker')
  @UseGuards(JwtAuthGuard)
  async updateTracker(
    @Req() req: Request,
    @Param('id') jobId: string,
    @Body('stage') stage: string,
    @Body('notes') notes?: string,
  ) {
    return this.jobsService.updateTrackerStage((req as any).user.sub, jobId, stage, notes);
  }

  @Get('user/tracked')
  @UseGuards(JwtAuthGuard)
  async getTrackedJobs(@Req() req: Request) {
    return this.jobsService.getTrackedJobs((req as any).user.sub);
  }

  @Get('user/tracker-stats')
  @UseGuards(JwtAuthGuard)
  async getTrackerStats(@Req() req: Request) {
    return this.jobsService.getTrackerStats((req as any).user.sub);
  }
}
