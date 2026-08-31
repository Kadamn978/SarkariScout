import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { CrawlerModule } from '../crawler/crawler.module'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [CrawlerModule, EmailModule],
  providers: [CronService],
})
export class CronModule {}
