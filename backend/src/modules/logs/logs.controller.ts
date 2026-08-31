import { Controller, Get, Param, Query, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common'
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard'
import { Roles } from '../../modules/auth/roles.decorator'
import { RolesGuard } from '../../modules/auth/roles.guard'
import { AuditService } from '../../common/logger/audit.service'
import { ErrorLogService } from '../../common/logger/error-log.service'
import { LogCleanupService } from '../../common/logger/log-cleanup.service'
import * as fs from 'fs'
import * as fsPromises from 'fs/promises'
import * as path from 'path'

@Controller('system/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class LogsController {
  constructor(
    private auditService: AuditService,
    private errorLogService: ErrorLogService,
    private cleanupService: LogCleanupService,
  ) {}

  @Get('audit')
  async getAuditLogs(@Query('limit') limit?: string) {
    return this.auditService.getRecent(limit ? parseInt(limit) : 50)
  }

  @Get('audit/user/:userId')
  async getAuditByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditService.getByUser(userId, limit ? parseInt(limit) : 50)
  }

  @Get('errors')
  async getErrors(@Query('hours') hours?: string) {
    return this.errorLogService.getRecentErrors(hours ? parseInt(hours) : 24)
  }

  @Get('errors/stats')
  async getErrorStats(@Query('hours') hours?: string) {
    return this.errorLogService.getErrorStats(hours ? parseInt(hours) : 24)
  }

  @Get('files')
  async getLogFiles() {
    return this.cleanupService.getLogStats()
  }

  @Get('files/:date')
  async getLogFile(@Param('date') date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD')
    }
    const logsDir = path.join(process.cwd(), 'logs')
    const month = date.slice(0, 7)
    const filePath = path.join(logsDir, month, `${date}.log`)
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(path.resolve(logsDir))) {
      throw new BadRequestException('Invalid path')
    }
    try {
      const content = await fsPromises.readFile(filePath, 'utf8')
      return { date, lines: content.split('\n').filter(Boolean) }
    } catch {
      throw new NotFoundException('Log file not found')
    }
  }

  @Get('cleanup')
  async cleanup(@Query('retention') retention?: string) {
    return this.cleanupService.cleanupOldLogs(retention ? parseInt(retention) : 90)
  }
}
