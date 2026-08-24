import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('ERROR');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const errMsg = exception instanceof Error ? exception.message : String(exception);
    const errStack = exception instanceof Error ? (exception as any).stack : undefined;

    this.logger.error(`${request.method} ${request.originalUrl} ${status}`, {
      status,
      method: request.method,
      url: request.originalUrl,
      ip: request.ip || 'unknown',
      userId: (request as any).user?.sub || 'anonymous',
      userAgent: request.headers['user-agent'] || 'unknown',
      error: errMsg,
      stack: errStack,
      body: this.sanitizeBody(request.body),
      query: request.query,
      params: request.params,
      causedBy: this.extractCause(exception),
    });

    this.logger.audit(`ERROR ${request.method} ${request.originalUrl} ${status}`, (request as any).user?.sub, {
      status, error: errMsg,
    });

    const errorResponse = typeof message === 'string'
      ? { statusCode: status, message, timestamp: new Date().toISOString(), path: request.url }
      : { statusCode: status, ...(message as any), timestamp: new Date().toISOString(), path: request.url };

    // In production, strip internal details from non-HTTP exceptions
    if (process.env.NODE_ENV === 'production' && !(exception instanceof HttpException)) {
      delete (errorResponse as any).path;
      delete (errorResponse as any).error;
      (errorResponse as any).message = 'An error occurred';
    }

    response.status(status).json(errorResponse);
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    const sanitized = { ...body };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken'];
    for (const key of sensitiveKeys) {
      if (sanitized[key]) sanitized[key] = '[REDACTED]';
    }
    return sanitized;
  }

  private extractCause(err: unknown): string {
    if (err instanceof Error && (err as any).cause) {
      const cause = (err as any).cause;
      return cause instanceof Error ? cause.message : String(cause);
    }
    if (err instanceof HttpException) {
      const resp = err.getResponse();
      if (typeof resp === 'object' && (resp as any).error) return (resp as any).error;
    }
    return 'unknown';
  }
}
