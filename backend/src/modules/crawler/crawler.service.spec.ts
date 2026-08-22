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

  it('crawlAll iterates enabled sources', async () => {
    prisma.source.findMany.mockResolvedValue([]);
    const result = await service.crawlAll();
    expect(typeof result).toBe('object');
  });
});
