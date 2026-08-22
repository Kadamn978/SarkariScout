import { Controller, Get, Post, Param, Query, UseGuards, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
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
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);
    return this.jobsService.findAll({ state, examFamily, status, search, page: safePage, limit: safeLimit });
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
