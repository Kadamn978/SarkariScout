import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { RedisService } from '../redis/redis.service'
import { Response } from 'express'

interface LockoutConfig {
  thresholds: { failures: number; lockoutMinutes: number }[]
}

const DEFAULT_CONFIG: LockoutConfig = {
  thresholds: [
    { failures: 5, lockoutMinutes: 15 },
    { failures: 10, lockoutMinutes: 60 },
    { failures: 15, lockoutMinutes: 1440 },
  ],
}

@Injectable()
export class ExponentialThrottleGuard implements CanActivate {
  private readonly logger = new Logger(ExponentialThrottleGuard.name)

  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse<Response>()

    const identifier = this.getIdentifier(request)
    const lockKey = `exp_lock:${identifier}`
    const failKey = `exp_fail:${identifier}`

    const lockExpiry = await this.redis.get(`${lockKey}:expiry`)
    if (lockExpiry) {
      const expiryTime = parseInt(lockExpiry, 10)
      const now = Date.now()
      if (now < expiryTime) {
        const remainingSec = Math.ceil((expiryTime - now) / 1000)
        response.setHeader('X-RateLimit-Remaining', '0')
        response.setHeader('X-RateLimit-Reset', Math.ceil(expiryTime / 1000).toString())
        throw new HttpException(
          `Too many failed attempts. Try again in ${this.formatDuration(remainingSec)}.`,
          HttpStatus.TOO_MANY_REQUESTS,
        )
      } else {
        await this.redis.del(lockKey)
        await this.redis.del(`${lockKey}:expiry`)
      }
    }

    const failCount = await this.getCurrentFailCount(identifier)
    const config = DEFAULT_CONFIG

    for (let i = config.thresholds.length - 1; i >= 0; i--) {
      if (failCount >= config.thresholds[i].failures) {
        const lockoutMinutes = config.thresholds[i].lockoutMinutes
        const expiryTime = Date.now() + lockoutMinutes * 60 * 1000
        await this.redis.set(lockKey, 'locked', lockoutMinutes * 60)
        await this.redis.set(`${lockKey}:expiry`, expiryTime.toString(), lockoutMinutes * 60)

        response.setHeader('X-RateLimit-Remaining', '0')
        response.setHeader('X-RateLimit-Reset', Math.ceil(expiryTime / 1000).toString())

        throw new HttpException(
          `Too many failed attempts. Account locked for ${this.formatDuration(lockoutMinutes * 60)}.`,
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }
    }

    const remainingAttempts = this.getRemainingAttempts(failCount, config)
    response.setHeader('X-RateLimit-Remaining', remainingAttempts.toString())
    response.setHeader('X-RateLimit-Reset', '')

    return true
  }

  async recordFailure(identifier: string): Promise<void> {
    const failKey = `exp_fail:${identifier}`
    const count = await this.redis.incr(failKey)
    if (count === 1) {
      await this.redis.expire(failKey, 86400)
    }
  }

  async resetFailures(identifier: string): Promise<void> {
    const failKey = `exp_fail:${identifier}`
    const lockKey = `exp_lock:${identifier}`
    await this.redis.del(failKey)
    await this.redis.del(lockKey)
    await this.redis.del(`${lockKey}:expiry`)
  }

  private async getCurrentFailCount(identifier: string): Promise<number> {
    const failKey = `exp_fail:${identifier}`
    const count = await this.redis.get(failKey)
    return count ? parseInt(count, 10) : 0
  }

  private getRemainingAttempts(failCount: number, config: LockoutConfig): number {
    for (const threshold of config.thresholds) {
      if (failCount < threshold.failures) {
        return threshold.failures - failCount
      }
    }
    return 0
  }

  private getIdentifier(request: any): string {
    const email = request.body?.email
    if (email) return `email:${email.toLowerCase().trim()}`
    const ip = request.ip || request.connection?.remoteAddress || 'unknown'
    return `ip:${ip}`
  }

  private formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`
    return `${Math.ceil(seconds / 3600)} hours`
  }
}
