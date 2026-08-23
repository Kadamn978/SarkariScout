import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip, userId } = this.getRequestInfo(req);
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const res = context.switchToHttp().getResponse();
          this.logger.log(`${method} ${url} ${res.statusCode} ${ms}ms`, {
            method, url, status: res.statusCode, ms, ip, userId,
          });
          this.logger.audit(`${method} ${url} ${res.statusCode}`, userId, {
            method, url, status: res.statusCode, ms, ip,
          });
        },
        error: (err) => {
          const ms = Date.now() - start;
          this.logger.error(`${method} ${url} ${err.status || 500} ${ms}ms`, {
            method, url, status: err.status || 500, ms, ip, userId,
            error: err.message, stack: err.stack,
          });
        },
      }),
    );
  }

  private getRequestInfo(req: any) {
    return {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userId: req.user?.sub || 'anonymous',
    };
  }
}
