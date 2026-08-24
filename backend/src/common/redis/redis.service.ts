import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  async onModuleInit() {
    this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async onModuleDestroy() {
    await this.redisClient.disconnect();
  }

  get client() {
    return this.redisClient;
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redisClient.expire(key, ttlSeconds);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async ping(): Promise<string> {
    return this.redisClient.ping();
  }
}
