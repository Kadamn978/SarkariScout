import { Test, TestingModule } from '@nestjs/testing';
import { ChangeDetectorService } from './change-detector.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ChangeDetectorService', () => {
  let service: ChangeDetectorService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      job: { findUnique: jest.fn() },
      jobChange: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
      userJob: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeDetectorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ChangeDetectorService>(ChangeDetectorService);
  });

  it('detects no changes when job unchanged', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'j1', applyEnd: '2026-12-01', examDate: null, examVenue: null,
      totalVacancies: 100, applyUrl: null, status: 'OPEN',
    });
    const changes = await service.detectChanges('j1', { applyEnd: '2026-12-01' });
    expect(changes).toHaveLength(0);
  });

  it('detects deadline change', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'j1', applyEnd: '2026-12-01', examDate: null, examVenue: null,
      totalVacancies: 100, applyUrl: null, status: 'OPEN',
    });
    const changes = await service.detectChanges('j1', { applyEnd: '2026-12-15' });
    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0].field).toBe('applyEnd');
    expect(changes[0].type).toBe('DEADLINE');
  });

  it('records changes to database', async () => {
    await service.recordChanges([{ jobId: 'j1', type: 'DEADLINE', field: 'applyEnd', before: 'old', after: 'new' }]);
    expect(prisma.jobChange.create).toHaveBeenCalled();
  });

  it('returns empty changes when job not found', async () => {
    prisma.job.findUnique.mockResolvedValue(null);
    const changes = await service.detectChanges('j1', {});
    expect(changes).toHaveLength(0);
  });
});
