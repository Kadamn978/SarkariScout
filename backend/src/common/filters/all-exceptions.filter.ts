import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = 500
    let message = 'Internal server error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse()
      const rawMessage =
        typeof res === 'string'
          ? res
          : typeof res === 'object' && res !== null && 'message' in res
            ? String((res as Record<string, unknown>).message)
            : message

      // Sanitize error messages in production — don't leak internal details
      const isProd = process.env.NODE_ENV === 'production'
      if (isProd && status >= 500) {
        message = 'Internal server error'
      } else if (isProd && status === 400) {
        // Don't expose parser details or validation internals
        message = 'Bad request'
      } else {
        message = rawMessage
      }
    } else if (exception instanceof Error) {
      const isProd = process.env.NODE_ENV === 'production'
      message = isProd ? 'Internal server error' : exception.message
      this.logger.error(
        `[${request.method}] ${request.url} ${status} - ${exception.message}`,
        exception.stack,
      )
    } else {
      this.logger.error(`[${request.method}] ${request.url} ${status}`, String(exception))
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
