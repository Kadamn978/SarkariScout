import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { HealthModule } from './modules/health/health.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { MatchingModule } from './modules/matching/matching.module';
import { EmailModule } from './modules/email/email.module';
import { ChangesModule } from './modules/changes/changes.module';
import { LogsModule } from './modules/logs/logs.module';
import { CronModule } from './modules/cron/cron.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    JobsModule,
    HealthModule,
    CrawlerModule,
    MatchingModule,
    EmailModule,
    ChangesModule,
    LogsModule,
    CronModule,
  ],
})
export class AppModule {}
