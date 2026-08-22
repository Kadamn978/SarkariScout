import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MatchingService', () => {
  let service: MatchingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      profile: { findUnique: jest.fn().mockResolvedValue(null), count: jest.fn().mockResolvedValue(0) },
      job: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('returns empty when no profile', async () => {
    const result = await service.findMatchingJobs('user-1');
    expect(result).toEqual([]);
  });

  it('getJobMatchStats returns counts', async () => {
    const stats = await service.getJobMatchStats();
    expect(stats).toHaveProperty('totalJobs');
    expect(stats).toHaveProperty('totalUsers');
    expect(stats).toHaveProperty('expiringSoon');
  });
});
