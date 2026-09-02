import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, Query, ParseUUIDPipe } from '@nestjs/common'
import { MockTestsService } from './mock-tests.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { AuthRequest } from '../auth/auth-request.interface'
import { CreateMockTestDto } from './dto/create-mock-test.dto'
import { AddQuestionDto } from './dto/add-question.dto'
import { SubmitAttemptDto } from './dto/submit-attempt.dto'

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
      examFamily,
      qualification,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mockTestsService.findOne(id)
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  async startAttempt(@Req() req: AuthRequest, @Param('id', ParseUUIDPipe) testId: string) {
    return this.mockTestsService.startAttempt(req.user.sub, testId)
  }

  @Put('attempts/:attemptId/submit')
  @UseGuards(JwtAuthGuard)
  async submitAttempt(
    @Req() req: AuthRequest,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.mockTestsService.submitAttempt(req.user.sub, attemptId, dto.answers, dto.timeTakenSec)
  }

  @Get('attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  async getAttemptDetail(@Req() req: AuthRequest, @Param('attemptId') attemptId: string) {
    return this.mockTestsService.getAttemptDetail(req.user.sub, attemptId)
  }

  @Get('user/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Req() req: AuthRequest) {
    return this.mockTestsService.getUserStats(req.user.sub)
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id', ParseUUIDPipe) testId: string, @Query('limit') limit?: string) {
    return this.mockTestsService.getLeaderboard(testId, limit ? parseInt(limit) : 20)
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createTest(@Body() data: CreateMockTestDto) {
    return this.mockTestsService.createTest(data)
  }

  @Post('admin/:testId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async addQuestion(@Param('testId', ParseUUIDPipe) testId: string, @Body() data: AddQuestionDto) {
    return this.mockTestsService.addQuestion(testId, data)
  }

  @Put('admin/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async publishTest(@Param('id', ParseUUIDPipe) id: string) {
    return this.mockTestsService.publishTest(id)
  }
}
