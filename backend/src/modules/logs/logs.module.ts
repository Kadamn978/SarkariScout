import { Module } from '@nestjs/common'
import { LogsController } from './logs.controller'
import { AuditService } from '../../common/logger/audit.service'
import { ErrorLogService } from '../../common/logger/error-log.service'
import { LogCleanupService } from '../../common/logger/log-cleanup.service'

@Module({
  controllers: [LogsController],
  providers: [AuditService, ErrorLogService, LogCleanupService],
})
export class LogsModule {}
