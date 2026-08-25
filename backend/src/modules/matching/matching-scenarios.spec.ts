import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MatchingService — Full Run Scenarios', () => {
  let service: MatchingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
      job: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  describe('findMatchingJobs — Positive', () => {
    it('should return empty when no profile', async () => {
      const result = await service.findMatchingJobs('user-1');
      expect(result).toEqual([]);
    });

    it('should return matches when profile exists', async () => {
      prisma.profile.findUnique.mockResolvedValue({
        userId: 'u1',
        education: 'Graduate',
        state: 'Maharashtra',
        category: 'GENERAL',
      });
      prisma.job.findMany.mockResolvedValue([
        { id: 'j1', title: 'SSC CGL', qualificationLevels: '["Graduate"]', state: 'ALL_IN' },
      ]);

      const result = await service.findMatchingJobs('u1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findMatchingJobs — Negative', () => {
    it('should return empty for non-existent user', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      const result = await service.findMatchingJobs('nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle profile with missing fields', async () => {
      prisma.profile.findUnique.mockResolvedValue({
        userId: 'u1',
        education: null,
        state: null,
        category: null,
      });
      prisma.job.findMany.mockResolvedValue([]);

      const result = await service.findMatchingJobs('u1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getJobMatchStats — Positive', () => {
    it('should return stats object', async () => {
      prisma.job.count.mockResolvedValue(10);
      prisma.profile.count.mockResolvedValue(5);
      prisma.job.groupBy.mockResolvedValue([]);

      const result = await service.getJobMatchStats();
      expect(result).toHaveProperty('totalJobs');
      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('expiringSoon');
    });
  });

  describe('getJobMatchStats — Negative', () => {
    it('should return zero counts when empty', async () => {
      prisma.job.count.mockResolvedValue(0);
      prisma.profile.count.mockResolvedValue(0);
      prisma.job.groupBy.mockResolvedValue([]);

      const result = await service.getJobMatchStats();
      expect(result.totalJobs).toBe(0);
      expect(result.totalUsers).toBe(0);
    });
  });
});
