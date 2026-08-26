import { Controller, Get, Post, UseGuards, Req, Query, Body } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../auth/auth-request.interface';

@Controller('matching')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('my-jobs')
  @UseGuards(JwtAuthGuard)
  async getMyMatches(@Req() req: AuthRequest) {
    return this.matchingService.findMatchingJobs(req.user.sub);
  }

  @Get('search')
  async searchJobs(
    @Query('state') state?: string,
    @Query('category') category?: string,
    @Query('qualification') qualification?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.matchingService.findMatchingJobsPublic({
      state, category, qualification, search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post('score')
  @UseGuards(JwtAuthGuard)
  async scoreJob(@Req() req: AuthRequest, @Body('jobId') jobId: string) {
    const profile = await this.matchingService['prisma'].profile.findUnique({
      where: { userId: req.user.sub },
    });
    const job = await this.matchingService['prisma'].job.findUnique({
      where: { id: jobId },
    });
    if (!profile || !job) return { error: 'Profile or job not found' };
    return this.matchingService.matchJob(profile, job);
  }

  @Get('stats')
  async getStats() {
    return this.matchingService.getJobMatchStats();
  }
}
