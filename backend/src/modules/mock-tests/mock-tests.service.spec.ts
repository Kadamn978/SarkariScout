import { Test, TestingModule } from '@nestjs/testing';
import { MockTestsService } from './mock-tests.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MockTestsService', () => {
  let service: MockTestsService;
  let prisma: {
    mockTest: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    mockQuestion: {
      create: jest.Mock;
    };
    mockTestAttempt: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      mockTest: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      mockQuestion: {
        create: jest.fn(),
      },
      mockTestAttempt: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockTestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MockTestsService>(MockTestsService);
  });

  describe('findAll', () => {
    it('should return paginated tests with default params', async () => {
      const mockTests = [
        { id: 'mt1', title: 'SSC CGL Mock', totalQuestions: 10, _count: { attempts: 5 } },
      ];
      prisma.mockTest.findMany.mockResolvedValue(mockTests);
      prisma.mockTest.count.mockResolvedValue(1);

      const result = await service.findAll();
      expect(result.tests).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.tests[0].attemptCount).toBe(5);
    });

    it('should filter by examFamily', async () => {
      prisma.mockTest.findMany.mockResolvedValue([]);
      prisma.mockTest.count.mockResolvedValue(0);

      await service.findAll({ examFamily: 'SSC' });
      expect(prisma.mockTest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ examFamily: 'SSC' }),
        }),
      );
    });

    it('should handle pagination', async () => {
      prisma.mockTest.findMany.mockResolvedValue([]);
      prisma.mockTest.count.mockResolvedValue(50);

      const result = await service.findAll({ page: 2, limit: 10 });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should cap limit at 50', async () => {
      prisma.mockTest.findMany.mockResolvedValue([]);
      prisma.mockTest.count.mockResolvedValue(0);

      await service.findAll({ limit: 100 });
      expect(prisma.mockTest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return test with questions if found', async () => {
      const mockTest = {
        id: 'mt1',
        title: 'SSC CGL Mock',
        questions: [
          { id: 'q1', questionText: 'What is 2+2?', sortOrder: 1 },
          { id: 'q2', questionText: 'What is 3+3?', sortOrder: 2 },
        ],
        _count: { attempts: 5 },
      };
      prisma.mockTest.findUnique.mockResolvedValue(mockTest);

      const result = await service.findOne('mt1');
      expect(result).toEqual(mockTest);
      expect(result.questions).toHaveLength(2);
    });

    it('should throw NotFoundException when test not found', async () => {
      prisma.mockTest.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitAttempt', () => {
    it('should score answers and return results', async () => {
      const mockAttempt = {
        id: 'a1',
        userId: 'u1',
        score: null,
        test: {
          questions: [
            { id: 'q1', correctOption: 'A', marks: 1 },
            { id: 'q2', correctOption: 'B', marks: 2 },
            { id: 'q3', correctOption: 'C', marks: 1 },
          ],
        },
      };
      prisma.mockTestAttempt.findUnique.mockResolvedValue(mockAttempt);
      prisma.mockTestAttempt.update.mockResolvedValue({
        id: 'a1', score: 3, totalAnswered: 3, correctCount: 2, timeTakenSec: 120,
      });

      const result = await service.submitAttempt('u1', 'a1', { q1: 'A', q2: 'B', q3: 'A' }, 120);
      expect(result.score).toBe(3);
      expect(result.correctCount).toBe(2);
      expect(result.totalAnswered).toBe(3);
      expect(result.totalQuestions).toBe(3);
      expect(result.totalMarks).toBe(4);
      expect(result.percentage).toBe(75);
    });

    it('should throw NotFoundException when attempt not found', async () => {
      prisma.mockTestAttempt.findUnique.mockResolvedValue(null);

      await expect(service.submitAttempt('u1', 'nonexistent', {}, 0)).rejects.toThrow(NotFoundException);
    });

    it('should throw when user is not the attempt owner', async () => {
      const mockAttempt = {
        id: 'a1',
        userId: 'u_other',
        score: null,
        test: { questions: [] },
      };
      prisma.mockTestAttempt.findUnique.mockResolvedValue(mockAttempt);

      await expect(service.submitAttempt('u1', 'a1', {}, 0)).rejects.toThrow(NotFoundException);
    });

    it('should throw when attempt is already submitted', async () => {
      const mockAttempt = {
        id: 'a1',
        userId: 'u1',
        score: 5,
        test: { questions: [] },
      };
      prisma.mockTestAttempt.findUnique.mockResolvedValue(mockAttempt);

      await expect(service.submitAttempt('u1', 'a1', {}, 0)).rejects.toThrow(NotFoundException);
    });
  });

  describe('startAttempt', () => {
    it('should create a new attempt if none exists', async () => {
      prisma.mockTest.findUnique.mockResolvedValue({ id: 'mt1', isPublished: true });
      prisma.mockTestAttempt.findFirst.mockResolvedValue(null);
      prisma.mockTestAttempt.create.mockResolvedValue({ id: 'a1', testId: 'mt1', userId: 'u1', score: null });

      const result = await service.startAttempt('u1', 'mt1');
      expect(result.id).toBe('a1');
      expect(prisma.mockTestAttempt.create).toHaveBeenCalledWith({
        data: { testId: 'mt1', userId: 'u1' },
      });
    });

    it('should return existing attempt if one is in progress', async () => {
      prisma.mockTest.findUnique.mockResolvedValue({ id: 'mt1', isPublished: true });
      const existingAttempt = { id: 'a_existing', testId: 'mt1', userId: 'u1', score: null };
      prisma.mockTestAttempt.findFirst.mockResolvedValue(existingAttempt);

      const result = await service.startAttempt('u1', 'mt1');
      expect(result).toEqual(existingAttempt);
      expect(prisma.mockTestAttempt.create).not.toHaveBeenCalled();
    });

    it('should throw when test not found', async () => {
      prisma.mockTest.findUnique.mockResolvedValue(null);

      await expect(service.startAttempt('u1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw when test is not published', async () => {
      prisma.mockTest.findUnique.mockResolvedValue({ id: 'mt1', isPublished: false });

      await expect(service.startAttempt('u1', 'mt1')).rejects.toThrow(NotFoundException);
    });
  });
});
