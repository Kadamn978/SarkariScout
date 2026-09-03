import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

const logger = new Logger('CsrfMiddleware')
const isProd = process.env.NODE_ENV === 'production'
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim())

// Allow Vercel preview deployments (*.vercel.app)
const isVercelPreview = (origin: string): boolean => {
  try {
    const url = new URL(origin)
    return url.hostname.endsWith('.vercel.app') || url.hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Skip safe methods — no state change
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next()
    }

    // Skip health endpoint (used by monitoring/load balancers)
    if (req.path === '/api/health') {
      return next()
    }

    const origin = req.headers.origin
    const referer = req.headers.referer

    // Check Origin header first (modern browsers send this)
    if (origin) {
      const isAllowed = ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed)) || isVercelPreview(origin)
      if (!isAllowed) {
        logger.warn(`CSRF blocked: origin=${origin}`)
        throw new ForbiddenException('Invalid origin')
      }
      return next()
    }

    // Check Referer header as fallback (older browsers)
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        const isAllowed = ALLOWED_ORIGINS.some((allowed) => refererUrl.origin.startsWith(allowed)) || isVercelPreview(refererUrl.origin)
        if (!isAllowed) {
          logger.warn(`CSRF blocked: referer=${referer}`)
          throw new ForbiddenException('Invalid referer')
        }
        return next()
      } catch (e) {
        if (e instanceof ForbiddenException) throw e
        throw new ForbiddenException('Invalid referer')
      }
    }

    // No Origin + no Referer: allow server-to-server, curl, mobile apps
    // Only block browser-like requests (has cookies) without origin
    if (req.headers.cookie && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      if (!req.path.startsWith('/api/auth/')) {
        logger.warn(`CSRF blocked: no origin, has cookies, method=${req.method} path=${req.path}`)
        throw new ForbiddenException('Missing origin header')
      }
    }

    next()
  }
}
