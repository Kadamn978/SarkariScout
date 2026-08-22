import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  async findAll(
    @Query('state') state?: string,
    @Query('examFamily') examFamily?: string,
    @Query('status') status?: string,
  ) {
    return this.jobsService.findAll({ state, examFamily, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post(':id/track')
  @UseGuards(JwtAuthGuard)
  async trackJob(@Req() req: Request, @Param('id') jobId: string) {
    return this.jobsService.trackJob((req as any).user.sub, jobId);
  }

  @Get('user/tracked')
  @UseGuards(JwtAuthGuard)
  async getTrackedJobs(@Req() req: Request) {
    return this.jobsService.getTrackedJobs((req as any).user.sub);
  }
}
