import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import * as crypto from 'crypto'
import { RedisService } from '../redis/redis.service'

@Injectable()
export class FingerprintMiddleware implements NestMiddleware {
  private readonly logger = new Logger(FingerprintMiddleware.name)

  constructor(private redis: RedisService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const ua = req.headers['user-agent'] || ''
    const acceptLang = req.headers['accept-language'] || ''
    const acceptEnc = req.headers['accept-encoding'] || ''

    const raw = `${ua}|${acceptLang}|${acceptEnc}`
    const fingerprint = crypto.createHash('sha256').update(raw).digest('hex')

    req['fingerprint'] = fingerprint

    const sessionId = req.cookies?.['refresh_token'] || req.headers['authorization']?.split(' ')[1]

    if (sessionId) {
      const sessionKey = `session:${crypto.createHash('sha256').update(sessionId).digest('hex')}`

      this.redis.get(sessionKey).then((storedFp) => {
        if (storedFp && storedFp !== fingerprint) {
          this.logger.warn(
            `Fingerprint mismatch for session. Expected: ${storedFp.slice(0, 8)}..., Got: ${fingerprint.slice(0, 8)}...`,
          )
        } else if (!storedFp) {
          this.redis.set(sessionKey, fingerprint, 604800).catch((err) => {
            this.logger.warn(`Failed to store fingerprint: ${err.message}`)
          })
        }
      }).catch(() => {})
    }

    next()
  }
}
