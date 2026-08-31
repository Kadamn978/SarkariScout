import { Module, Global } from '@nestjs/common'
import { AuditService } from './logger/audit.service'
import { ErrorLogService } from './logger/error-log.service'
import { LoggingInterceptor } from './interceptors/logging.interceptor'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'

@Global()
@Module({
  providers: [AuditService, ErrorLogService, LoggingInterceptor, AllExceptionsFilter],
  exports: [AuditService, ErrorLogService, LoggingInterceptor, AllExceptionsFilter],
})
export class CommonModule {}
