import {
  Injectable,
  BadRequestException,
  NestMiddleware,
} from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { DISPOSABLE_EMAIL_DOMAINS } from './disposable-emails'

@Injectable()
export class TempEmailGuard implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const body = req.body
    if (body && body.email) {
      const email = String(body.email).toLowerCase().trim()
      const domain = email.split('@')[1]
      if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
        throw new BadRequestException(
          'Disposable/temporary email addresses are not allowed. Please use a permanent email.',
        )
      }
    }
    next()
  }
}
