import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('matching')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('my-jobs')
  @UseGuards(JwtAuthGuard)
  async getMyMatches(@Req() req: Request) {
    return this.matchingService.findMatchingJobs((req as any).user.sub);
  }

  @Get('stats')
  async getStats() {
    return this.matchingService.getJobMatchStats();
  }
}
