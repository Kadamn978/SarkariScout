import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name)

  captureException(error: Error, context?: Record<string, any>) {
    this.logger.error(`Error: ${error.message}`, error.stack)
    // In production, this would send to Sentry/external service
    // For now, we log to our custom error log
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    this.logger.log(`[${level}] ${message}`)
  }

  setUser(user: { id: string; email?: string }) {
    // In production, this would set Sentry user context
    this.logger.log(`User context set: ${user.id}`)
  }

  addBreadcrumb(message: string, data?: Record<string, any>) {
    // In production, this would add Sentry breadcrumb
    this.logger.debug(`Breadcrumb: ${message}`, data)
  }
}
