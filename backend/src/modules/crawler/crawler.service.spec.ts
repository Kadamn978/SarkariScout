import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerService } from './crawler.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeDetectorService } from '../changes/change-detector.service';

describe('CrawlerService', () => {
  let service: CrawlerService;
  let prisma: any;
  let changeDetector: any;

  beforeEach(async () => {
    prisma = {
      source: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      job: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      crawlLog: {
        create: jest.fn().mockResolvedValue({ id: 'cl1' }),
        update: jest.fn(),
      },
    };
    changeDetector = {
      detectChanges: jest.fn().mockResolvedValue([]),
      recordChanges: jest.fn(),
      notifyTrackedUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlerService,
        { provide: PrismaService, useValue: prisma },
        { provide: ChangeDetectorService, useValue: changeDetector },
      ],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  it('returns error for disabled source', async () => {
    prisma.source.findUnique.mockResolvedValue({ id: 's1', enabled: false });
    const result = await service.crawlSource('s1');
    expect(result.errors).toContain('Source disabled');
    expect(result.added).toBe(0);
  });

  it('returns error when source not found', async () => {
    prisma.source.findUnique.mockResolvedValue(null);
    const result = await service.crawlSource('nonexistent');
    expect(result.errors).toContain('Source disabled');
    expect(result.added).toBe(0);
  });

  describe('crawlAll', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'sleep').mockResolvedValue(undefined);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return empty results when no enabled sources', async () => {
      prisma.source.findMany.mockResolvedValue([]);
      const result = await service.crawlAll();
      expect(result).toEqual({});
      expect(prisma.source.findMany).toHaveBeenCalledWith({ where: { enabled: true } });
    });

    it('should iterate enabled sources and return results keyed by source id', async () => {
      prisma.source.findMany.mockResolvedValue([
        { id: 's1', enabled: true },
        { id: 's2', enabled: true },
      ]);
      prisma.source.findUnique.mockImplementation(({ where: { id } }: any) =>
        Promise.resolve({ id, enabled: true, name: `Source ${id}`, type: 'HTML', baseUrl: 'http://example.com' }),
      );

      const result = await service.crawlAll();
      expect(result).toHaveProperty('s1');
      expect(result).toHaveProperty('s2');
    });

    it('should handle error from crawlSource gracefully', async () => {
      prisma.source.findMany.mockResolvedValue([{ id: 's1', enabled: true }]);
      prisma.source.findUnique.mockResolvedValue({ id: 's1', enabled: true, name: 'Test', type: 'HTML', baseUrl: 'http://test.com' });
      jest.spyOn(service as any, 'fetchWithRetry').mockRejectedValue(new Error('DB connection lost'));

      const result = await service.crawlAll();
      expect(result).toHaveProperty('s1');
      expect(result.s1.errors.length).toBeGreaterThan(0);
    });

    it('should call crawlSource for each enabled source', async () => {
      prisma.source.findMany.mockResolvedValue([
        { id: 's1', enabled: true },
        { id: 's2', enabled: true },
        { id: 's3', enabled: true },
      ]);
      prisma.source.findUnique.mockResolvedValue({ id: 'x', enabled: false });

      await service.crawlAll();
      expect(prisma.source.findUnique).toHaveBeenCalledTimes(3);
    });

    it('should call sleep between source crawls', async () => {
      prisma.source.findMany.mockResolvedValue([
        { id: 's1', enabled: true },
        { id: 's2', enabled: true },
      ]);
      prisma.source.findUnique.mockResolvedValue({ id: 'x', enabled: false });

      await service.crawlAll();
      expect((service as any).sleep).toHaveBeenCalledWith(2000);
    });
  });

  describe('getSourceStats', () => {
    it('should return stats for all sources', async () => {
      prisma.source.findMany.mockResolvedValue([
        {
          id: 's1', name: 'SSC', type: 'HTML', enabled: true,
          lastRunAt: null, lastRunStatus: null, itemsPerRun: 0, totalItems: 0,
          crawlLogs: [],
        },
      ]);

      const result = await service.getSourceStats();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('s1');
      expect(result[0].name).toBe('SSC');
    });

    it('should include lastError from crawl logs', async () => {
      prisma.source.findMany.mockResolvedValue([
        {
          id: 's1', name: 'SSC', type: 'HTML', enabled: true,
          lastRunAt: new Date(), lastRunStatus: 'error', itemsPerRun: 0, totalItems: 0,
          crawlLogs: [{ status: 'error', errorMessage: 'Timeout' }],
        },
      ]);

      const result = await service.getSourceStats();
      expect(result[0].lastError).toBe('Timeout');
    });
  });

  describe('getCrawlHistory', () => {
    it('should return crawl logs for a source', async () => {
      const mockLogs = [{ id: 'cl1', sourceId: 's1', status: 'ok' }];
      prisma.crawlLog = { findMany: jest.fn().mockResolvedValue(mockLogs) };

      const result = await service.getCrawlHistory('s1');
      expect(result).toEqual(mockLogs);
    });
  });
});
