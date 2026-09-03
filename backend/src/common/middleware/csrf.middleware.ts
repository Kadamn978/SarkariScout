import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

const isProd = process.env.NODE_ENV === 'production'
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Only enforce CSRF on state-changing methods in production
    if (!isProd || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next()
    }

    const origin = req.headers.origin
    const referer = req.headers.referer
    const host = req.headers.host

    // Check Origin header first
    if (origin) {
      if (!ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
        throw new ForbiddenException('Invalid origin')
      }
    }

    // Check Referer header as fallback
    if (!origin && referer) {
      try {
        const refererUrl = new URL(referer)
        if (!ALLOWED_ORIGINS.some((allowed) => refererUrl.origin.startsWith(allowed))) {
          throw new ForbiddenException('Invalid referer')
        }
      } catch {
        throw new ForbiddenException('Invalid referer')
      }
    }

    // If neither Origin nor Referer present, check for same-site cookie pattern
    if (!origin && !referer && host) {
      // Allow requests without Origin/Referer only if they have the expected content type
      // This handles same-site form submissions
      const contentType = req.headers['content-type']
      if (contentType?.includes('application/json')) {
        // AJAX requests should have Origin header — reject if missing in production
        throw new ForbiddenException('Missing origin header')
      }
    }

    next()
  }
}
