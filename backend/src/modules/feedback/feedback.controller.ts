import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeedbackService } from './feedback.service';
import { BugStatus } from '@prisma/client';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post('bugs')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async reportBug(
    @Request() req: any,
    @Body() body: { title: string; description: string; category?: string; priority?: string },
  ) {
    const userId = req?.user?.sub || null;
    return this.feedbackService.createBugReport(
      userId,
      body.title,
      body.description,
      body.category,
      body.priority,
    );
  }

  @Get('bugs/my')
  @UseGuards(JwtAuthGuard)
  async getMyBugs(@Request() req: any) {
    return this.feedbackService.getMyBugReports(req.user.sub);
  }

  @Get('bugs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllBugs(@Query('status') status?: BugStatus) {
    return this.feedbackService.getAllBugReports(status);
  }

  @Patch('bugs/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBugStatus(
    @Param('id') id: string,
    @Body() body: { status: BugStatus; adminNotes?: string },
  ) {
    return this.feedbackService.updateBugStatus(id, body.status, body.adminNotes);
  }
}
