import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { JobsModule } from './modules/jobs/jobs.module'
import { HealthModule } from './modules/health/health.module'
import { CrawlerModule } from './modules/crawler/crawler.module'
import { MatchingModule } from './modules/matching/matching.module'
import { EmailModule } from './modules/email/email.module'
import { ChangesModule } from './modules/changes/changes.module'
import { LogsModule } from './modules/audit-logs/logs.module'
import { CronModule } from './modules/cron/cron.module'
import { DocumentsModule } from './modules/documents/documents.module'
import { FeedbackModule } from './modules/feedback/feedback.module'
import { MockTestsModule } from './modules/mock-tests/mock-tests.module'
import { PapersModule } from './modules/papers/papers.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './common/redis/redis.module'
import { TempEmailGuard } from './common/validation/temp-email.guard'
import { FingerprintMiddleware } from './common/middleware/fingerprint.middleware'
import { CsrfMiddleware } from './common/middleware/csrf.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
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
    DocumentsModule,
    FeedbackModule,
    MockTestsModule,
    PapersModule,
    AnalyticsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TempEmailGuard)
      .forRoutes({ path: 'auth/register', method: RequestMethod.POST })

    consumer
      .apply(FingerprintMiddleware)
      .forRoutes('*')

    consumer
      .apply(CsrfMiddleware)
      .forRoutes('*')
  }
}
