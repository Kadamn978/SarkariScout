import { Test, TestingModule } from '@nestjs/testing'
import { CrawlerService } from './crawler.service'
import { PrismaService } from '../../prisma/prisma.service'
import { ChangeDetectorService } from '../changes/change-detector.service'

describe('CrawlerService — Full Run Scenarios', () => {
  let service: CrawlerService
  let prisma: any
  let changeDetector: any

  beforeEach(async () => {
    prisma = {
      source: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      job: {
        findMany: jest.fn().mockResolvedValue([]),
        upsert: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      crawlLog: { create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    }
    changeDetector = { detectChanges: jest.fn().mockResolvedValue([]) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlerService,
        { provide: PrismaService, useValue: prisma },
        { provide: ChangeDetectorService, useValue: changeDetector },
      ],
    }).compile()

    service = module.get<CrawlerService>(CrawlerService)
  })

  describe('getSourceStats — Positive', () => {
    it('should return source stats array', async () => {
      prisma.source.findMany.mockResolvedValue([
        {
          id: 's1',
          name: 'SSC',
          type: 'RSS',
          enabled: true,
          lastRunAt: new Date(),
          lastRunStatus: 'success',
          itemsPerRun: 10,
          totalItems: 100,
          crawlLogs: [],
        },
      ])

      const result = await service.getSourceStats()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('name', 'SSC')
    })
  })

  describe('crawlAll — Positive', () => {
    it('should return crawl results', async () => {
      prisma.source.findMany.mockResolvedValue([
        { id: 's1', name: 'SSC', url: 'https://ssc.nic.in', type: 'RSS' },
      ])

      const result = await service.crawlAll()
      expect(result).toBeDefined()
    })
  })
})
