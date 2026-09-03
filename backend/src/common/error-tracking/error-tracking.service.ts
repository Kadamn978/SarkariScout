import { Injectable, Logger } from '@nestjs/common'

let Sentry: any = null

@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name)
  private readonly isProduction: boolean
  private initialized = false

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.initialized = false
    this.init()
  }

  private init() {
    const dsn = process.env.SENTRY_DSN
    if (!dsn || !this.isProduction) {
      this.logger.log('Sentry skipped (not production or no DSN)')
      return
    }

    try {
      // Dynamic import to avoid loading @sentry/node in dev
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      Sentry = require('@sentry/node')
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
        release: process.env.npm_package_version || 'unknown',
        tracesSampleRate: 0.1,
        beforeSend(event) {
          // Strip sensitive data
          if (event.request?.cookies) delete event.request.cookies
          if (event.request?.headers) {
            delete event.request.headers.authorization
            delete event.request.headers.cookie
          }
          return event
        },
      })
      ;(this as any).initialized = true
      this.logger.log('Sentry initialized for production')
    } catch (err) {
      this.logger.warn(`Sentry init failed: ${(err as Error).message}`)
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    this.logger.error(`Error: ${error.message}`, error.stack)
    if (this.initialized && Sentry) {
      Sentry.withScope((scope) => {
        if (context) scope.setExtras(context)
        Sentry.captureException(error)
      })
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    this.logger.log(`[${level}] ${message}`)
    if (this.initialized && Sentry) {
      Sentry.captureMessage(message, level as any)
    }
  }

  setUser(user: { id: string; email?: string }) {
    this.logger.log(`User context set: ${user.id}`)
    if (this.initialized && Sentry) {
      Sentry.setUser({ id: user.id, email: user.email })
    }
  }

  addBreadcrumb(message: string, data?: Record<string, any>) {
    this.logger.debug(`Breadcrumb: ${message}`, data)
    if (this.initialized && Sentry) {
      Sentry.addBreadcrumb({ message, data, level: 'info' })
    }
  }
}
