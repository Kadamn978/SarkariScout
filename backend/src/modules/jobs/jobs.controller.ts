import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Req, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../auth/auth-request.interface';

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
    @Req() req: AuthRequest,
    @Param('id') jobId: string,
    @Body('stage') stage?: string,
  ) {
    return this.jobsService.trackJob(req.user.sub, jobId, stage);
  }

  @Delete(':id/track')
  @UseGuards(JwtAuthGuard)
  async untrackJob(@Req() req: AuthRequest, @Param('id') jobId: string) {
    return this.jobsService.untrackJob(req.user.sub, jobId);
  }

  @Put(':id/tracker')
  @UseGuards(JwtAuthGuard)
  async updateTracker(
    @Req() req: AuthRequest,
    @Param('id') jobId: string,
    @Body('stage') stage: string,
    @Body('notes') notes?: string,
  ) {
    return this.jobsService.updateTrackerStage(req.user.sub, jobId, stage, notes);
  }

  @Get('user/tracked')
  @UseGuards(JwtAuthGuard)
  async getTrackedJobs(@Req() req: AuthRequest) {
    return this.jobsService.getTrackedJobs(req.user.sub);
  }

  @Get('user/tracker-stats')
  @UseGuards(JwtAuthGuard)
  async getTrackerStats(@Req() req: AuthRequest) {
    return this.jobsService.getTrackerStats(req.user.sub);
  }
}
