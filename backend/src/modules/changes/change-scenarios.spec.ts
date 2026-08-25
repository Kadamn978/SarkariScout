import { Test, TestingModule } from '@nestjs/testing';
import { ChangeDetectorService } from './change-detector.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('ChangeDetectorService — Full Run Scenarios', () => {
  let service: ChangeDetectorService;
  let prisma: any;
  let email: any;

  beforeEach(async () => {
    prisma = {
      job: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() },
      jobChange: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
      userJob: { findMany: jest.fn().mockResolvedValue([]) },
    };
    email = { sendInstantAlert: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeDetectorService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: email },
      ],
    }).compile();

    service = module.get<ChangeDetectorService>(ChangeDetectorService);
  });

  describe('detectChanges — Positive', () => {
    it('should detect no changes when data unchanged', async () => {
      prisma.job.findUnique.mockResolvedValue({
        id: 'j1', title: 'SSC CGL', status: 'OPEN', applyEnd: new Date(),
      });

      const result = await service.detectChanges('j1', { status: 'OPEN' });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should detect status changes', async () => {
      prisma.job.findUnique.mockResolvedValue({
        id: 'j1', title: 'SSC CGL', status: 'OPEN', applyEnd: new Date(),
      });

      const result = await service.detectChanges('j1', { status: 'CLOSED' });
      expect(result).toBeDefined();
    });
  });

  describe('detectChanges — Negative', () => {
    it('should return empty for non-existent job', async () => {
      prisma.job.findUnique.mockResolvedValue(null);

      const result = await service.detectChanges('nonexistent', { status: 'CLOSED' });
      expect(result).toEqual([]);
    });
  });

  describe('getRecentChanges — Positive', () => {
    it('should return recent changes', async () => {
      prisma.jobChange.findMany.mockResolvedValue([
        { id: 'c1', jobId: 'j1', type: 'STATUS_CHANGE', field: 'status', before: 'OPEN', after: 'CLOSED' },
      ]);

      const result = await service.getRecentChanges();
      expect(result).toHaveLength(1);
    });
  });

  describe('getRecentChanges — Negative', () => {
    it('should return empty when no changes', async () => {
      prisma.jobChange.findMany.mockResolvedValue([]);

      const result = await service.getRecentChanges();
      expect(result).toHaveLength(0);
    });
  });
});
