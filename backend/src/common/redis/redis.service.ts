import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis
  private readonly logger = new Logger(RedisService.name)
  private _connected = false

  async onModuleInit() {
    this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy(times: number) {
        if (times > 10) {
          return null
        }
        return Math.min(times * 200, 5000)
      },
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 5000,
    })

    this.redisClient.on('connect', () => {
      this._connected = true
      this.logger.log('Redis connected')
    })

    this.redisClient.on('error', (err) => {
      this._connected = false
      this.logger.warn(`Redis error: ${err.message}`)
    })

    this.redisClient.on('close', () => {
      this._connected = false
      this.logger.warn('Redis connection closed')
    })

    try {
      await this.redisClient.connect()
    } catch {
      this.logger.warn('Redis unavailable — running without cache')
    }
  }

  async onModuleDestroy() {
    try {
      await this.redisClient.disconnect()
    } catch {}
  }

  get client() {
    return this.redisClient
  }

  get isConnected() {
    return this._connected
  }

  async get(key: string): Promise<string | null> {
    if (!this._connected) return null
    try {
      return await this.redisClient.get(key)
    } catch {
      return null
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this._connected) return
    try {
      if (ttlSeconds) {
        await this.redisClient.set(key, value, 'EX', ttlSeconds)
      } else {
        await this.redisClient.set(key, value)
      }
    } catch {}
  }

  async del(key: string): Promise<void> {
    if (!this._connected) return
    try {
      await this.redisClient.del(key)
    } catch {}
  }

  async incr(key: string): Promise<number> {
    if (!this._connected) return 0
    try {
      return await this.redisClient.incr(key)
    } catch {
      return 0
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this._connected) return
    try {
      await this.redisClient.expire(key, ttlSeconds)
    } catch {}
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this._connected) return []
    try {
      return await this.redisClient.keys(pattern)
    } catch {
      return []
    }
  }

  async ping(): Promise<string> {
    if (!this._connected) return 'PONG (disconnected)'
    try {
      return await this.redisClient.ping()
    } catch {
      return 'PONG (error)'
    }
  }
}
