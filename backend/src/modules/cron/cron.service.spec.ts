import { Test, TestingModule } from '@nestjs/testing'
import { CronService } from './cron.service'
import { CrawlerService } from '../crawler/crawler.service'
import { EmailService } from '../email/email.service'
import { AdaptiveSchedulerService } from '../crawler/adaptive-scheduler.service'
import { JobDeletionDetectorService } from '../crawler/job-deletion-detector.service'
import { RSSMonitorService } from '../crawler/rss-monitor.service'
import { NotificationPdfService } from '../crawler/notification-pdf.service'
import { PrismaService } from '../../prisma/prisma.service'
import * as sharedUtils from '../crawler/shared-utils'

describe('CronService', () => {
  let service: CronService
  let crawler: { crawlAll: jest.Mock; crawlSource: jest.Mock }
  let email: { sendDailyDigest: jest.Mock }
  let adaptiveScheduler: { getCrawlPlan: jest.Mock; shouldCrawl: jest.Mock; markCrawled: jest.Mock; getCurrentWindow: jest.Mock }
  let prisma: any

  beforeEach(async () => {
    crawler = { crawlAll: jest.fn().mockResolvedValue({}), crawlSource: jest.fn().mockResolvedValue({ added: 0, updated: 0, errors: [] }) }
    email = { sendDailyDigest: jest.fn().mockResolvedValue({ sent: 1, total: 1 }) }
    adaptiveScheduler = {
      getCrawlPlan: jest.fn().mockResolvedValue([]),
      shouldCrawl: jest.fn().mockReturnValue(true),
      markCrawled: jest.fn(),
      getCurrentWindow: jest.fn().mockReturnValue({ label: 'test', intervalMs: 300000 }),
    }
    prisma = {
      job: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      source: {
        findMany: jest.fn().mockResolvedValue([{ id: 's1', enabled: true }]),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        { provide: CrawlerService, useValue: crawler },
        { provide: EmailService, useValue: email },
        { provide: AdaptiveSchedulerService, useValue: adaptiveScheduler },
        { provide: JobDeletionDetectorService, useValue: { detectDeletedJobs: jest.fn().mockResolvedValue([]) } },
        { provide: RSSMonitorService, useValue: { checkAllFeeds: jest.fn().mockResolvedValue([]), monitorAllFeeds: jest.fn().mockResolvedValue([]) } },
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationPdfService, useValue: { purgeExpiredPdfs: jest.fn().mockResolvedValue(0) } },
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

      // adaptive(5min) + rss(30min) + deletion(6h) + autoExpire(6h) + schedulerCleanup(1h) + digest(1min) + pdfRetention(6h) = 7 intervals + timeouts
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(7)
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

  describe('handleCron (runAdaptiveCrawler)', () => {
    it('should call crawler.crawlSource for each due source', async () => {
      await (service as any).runAdaptiveCrawler()

      expect(crawler.crawlSource).toHaveBeenCalled()
    })

    it('should handle crawler errors gracefully', async () => {
      crawler.crawlSource.mockRejectedValue(new Error('Network timeout'))

      await expect((service as any).runAdaptiveCrawler()).resolves.not.toThrow()
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
