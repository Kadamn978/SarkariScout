import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ChangeDetectorService } from './change-detector.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

@Controller('changes')
export class ChangesController {
  constructor(private changeDetector: ChangeDetectorService) {}

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
  async getJobChanges(@Param('jobId') jobId: string, @Query('limit') limit?: string) {
    return this.changeDetector.getJobChanges(jobId, limit ? parseInt(limit) : 20)
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRecentChanges(@Query('limit') limit?: string) {
    return this.changeDetector.getRecentChanges(limit ? parseInt(limit) : 50)
  }

  @Get('unnotified')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUnnotifiedChanges() {
    return this.changeDetector.getUnnotifiedChanges()
  }
}
