import { Test, TestingModule } from '@nestjs/testing'
import { CronService } from './cron.service'
import { CrawlerService } from '../crawler/crawler.service'
import { EmailService } from '../email/email.service'
import { AdaptiveSchedulerService } from '../crawler/adaptive-scheduler.service'
import { JobDeletionDetectorService } from '../crawler/job-deletion-detector.service'
import { RSSMonitorService } from '../crawler/rss-monitor.service'
import { PrismaService } from '../../prisma/prisma.service'
import * as sharedUtils from '../crawler/shared-utils'

describe('CronService', () => {
  let service: CronService
  let crawler: { crawlAll: jest.Mock }
  let email: { sendDailyDigest: jest.Mock }

  beforeEach(async () => {
    crawler = { crawlAll: jest.fn().mockResolvedValue({}) }
    email = { sendDailyDigest: jest.fn().mockResolvedValue({ sent: 1, total: 1 }) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        { provide: CrawlerService, useValue: crawler },
        { provide: EmailService, useValue: email },
        {
          provide: AdaptiveSchedulerService,
          useValue: { getCrawlPlan: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: JobDeletionDetectorService,
          useValue: { detectDeletedJobs: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: RSSMonitorService,
          useValue: { checkAllFeeds: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: PrismaService,
          useValue: {
            job: {
              updateMany: jest.fn().mockResolvedValue({ count: 0 }),
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
          },
        },
      ],
    }).compile()

    service = module.get<CronService>(CronService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('onModuleInit', () => {
    it('should set up intervals on init', () => {
      const spy = jest.spyOn(global, 'setInterval')

      service.onModuleInit()

      // adaptive(5min) + rss(30min) + deletion(6h) + autoExpire(6h) + digest(1min) = 5 intervals + timeouts
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('onModuleDestroy', () => {
    it('should clear all intervals on destroy', () => {
      const spy = jest.spyOn(global, 'clearInterval')
      const mockInterval = 123 as unknown as NodeJS.Timeout
      ;(service as any).intervals = [mockInterval]

      service.onModuleDestroy()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toBe(mockInterval)
    })
  })

  describe('handleCron (runCrawler)', () => {
    it('should call crawler.crawlAll when triggered', async () => {
      crawler.crawlAll.mockResolvedValue({
        source1: { added: 5, updated: 2, errors: [] },
      })

      await (service as any).runCrawler()

      expect(crawler.crawlAll).toHaveBeenCalled()
    })

    it('should handle crawler errors gracefully', async () => {
      crawler.crawlAll.mockRejectedValue(new Error('Network timeout'))

      await expect((service as any).runCrawler()).resolves.not.toThrow()
      expect(crawler.crawlAll).toHaveBeenCalled()
    })
  })

  describe('checkDigestTime', () => {
    it('should send digest if current IST time is 9:05', async () => {
      const fakeIST = new Date()
      fakeIST.setHours(9, 5, 0, 0)
      jest.spyOn(sharedUtils, 'getIST').mockReturnValue(fakeIST)

      await (service as any).checkDigestTime()

      expect(email.sendDailyDigest).toHaveBeenCalled()
    })

    it('should not send digest if current IST time is not 9:05', async () => {
      const fakeIST = new Date()
      fakeIST.setHours(10, 30, 0, 0)
      jest.spyOn(sharedUtils, 'getIST').mockReturnValue(fakeIST)

      await (service as any).checkDigestTime()

      expect(email.sendDailyDigest).not.toHaveBeenCalled()
    })

    it('should handle digest send errors gracefully', async () => {
      const fakeIST = new Date()
      fakeIST.setHours(9, 5, 0, 0)
      jest.spyOn(sharedUtils, 'getIST').mockReturnValue(fakeIST)
      email.sendDailyDigest.mockRejectedValue(new Error('SMTP failed'))

      await expect((service as any).checkDigestTime()).resolves.not.toThrow()
    })
  })
})
