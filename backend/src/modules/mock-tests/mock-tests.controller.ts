import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { MockTestsService } from './mock-tests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthRequest } from '../auth/auth-request.interface';

@Controller('mock-tests')
export class MockTestsController {
  constructor(private mockTestsService: MockTestsService) {}

  @Get()
  async findAll(
    @Query('examFamily') examFamily?: string,
    @Query('qualification') qualification?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mockTestsService.findAll({
      examFamily, qualification,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mockTestsService.findOne(id);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  async startAttempt(@Req() req: AuthRequest, @Param('id') testId: string) {
    return this.mockTestsService.startAttempt(req.user.sub, testId);
  }

  @Put('attempts/:attemptId/submit')
  @UseGuards(JwtAuthGuard)
  async submitAttempt(
    @Req() req: AuthRequest,
    @Param('attemptId') attemptId: string,
    @Body('answers') answers: Record<string, string>,
    @Body('timeTakenSec') timeTakenSec: number,
  ) {
    return this.mockTestsService.submitAttempt(req.user.sub, attemptId, answers, timeTakenSec);
  }

  @Get('attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  async getAttemptDetail(@Req() req: AuthRequest, @Param('attemptId') attemptId: string) {
    return this.mockTestsService.getAttemptDetail(req.user.sub, attemptId);
  }

  @Get('user/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Req() req: AuthRequest) {
    return this.mockTestsService.getUserStats(req.user.sub);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') testId: string, @Query('limit') limit?: string) {
    return this.mockTestsService.getLeaderboard(testId, limit ? parseInt(limit) : 20);
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createTest(@Body() data: any) {
    return this.mockTestsService.createTest(data);
  }

  @Post('admin/:testId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async addQuestion(@Param('testId') testId: string, @Body() data: any) {
    return this.mockTestsService.addQuestion(testId, data);
  }

  @Put('admin/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async publishTest(@Param('id') id: string) {
    return this.mockTestsService.publishTest(id);
  }
}
