# QA Engineer Output

**File:** `src/mock-test/mock-test.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MockTestService } from './mock-test.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AttemptStatus,
  QuestionType,
  DifficultyLevel,
} from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MockTestService', () => {
  let service: MockTestService;
  let prisma: jest.Mocked<PrismaService>;

  // ---- Mock data ---------------------------------------------------------
  const mockUserId = 'user-123';
  const mockTestId = 'test-456';
  const mockAttemptId = 'attempt-789';

  const mockTest = {
    id: mockTestId,
    title: 'Reasoning Mock Test',
    totalQuestions: 5,
    durationMinutes: 30,
    isActive: true,
    questions: [
      {
        id: 'q1',
        text: 'What is 2+2?',
        type: QuestionType.MCQ,
        options: ['3', '4', '5', '6'],
        correctOptionIndex: 1,
        marks: 2,
        difficulty: DifficultyLevel.EASY,
      },
      {
        id: 'q2',
        text: 'Which is a vowel?',
        type: QuestionType.MCQ,
        options: ['B', 'C', 'D', 'E'],
        correctOptionIndex: 3,
        marks: 2,
        difficulty: DifficultyLevel.EASY,
      },
      {
        id: 'q3',
        text: 'Select the odd one out.',
        type: QuestionType.MCQ,
        options: ['Apple', 'Banana', 'Carrot', 'Grape'],
        correctOptionIndex: 2,
        marks: 2,
        difficulty: DifficultyLevel.MEDIUM,
      },
      {
        id: 'q4',
        text: 'Complete the series: 2, 4, 8, ?',
        type: QuestionType.MCQ,
        options: ['10', '12', '16', '20'],
        correctOptionIndex: 2,
        marks: 2,
        difficulty: DifficultyLevel.MEDIUM,
      },
      {
        id: 'q5',
        text: 'True or False: The sun rises in the west.',
        type: QuestionType.TF,
        options: ['True', 'False'],
        correctOptionIndex: 1,
        marks: 2,
        difficulty: DifficultyLevel.HARD,
      },
    ],
  };

  const mockAttemptInProgress = {
    id: mockAttemptId,
    userId: mockUserId,
    testId: mockTestId,
    status: AttemptStatus.IN_PROGRESS,
    startedAt: new Date(),
    submittedAt: null,
    score: null,
  };

  const mockAttemptCompleted = {
    ...mockAttemptInProgress,
    status: AttemptStatus.COMPLETED,
    submittedAt: new Date(),
    score: 8, // 4 correct * 2 marks
  };

  // ---- Setup -------------------------------------------------------------
  beforeEach(async () => {
    prisma = {
      mockTest: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      attempt: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      answer: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      user: {
        count: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockTestService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MockTestService>(MockTestService);
    jest.clearAllMocks();
  });

  // ==== 1) Starting an attempt ============================================
  describe('startAttempt', () => {
    it('should start a new attempt when test exists and user is under limit', async () => {
      prisma.mockTest.findUnique.mockResolvedValue(mockTest);
      prisma.attempt.count.mockResolvedValue(0); // user has 0 attempts today
      prisma.attempt.create.mockResolvedValue(mockAttemptInProgress);

      const attempt = await service.startAttempt(mockUserId, mockTestId);

      expect(prisma.mockTest.findUnique).toHaveBeenCalledWith({
        where: { id: mockTestId },
        include: { questions: true },
      });
      expect(prisma.attempt.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          testId: mockTestId,
          startedAt: {
            gte: expect.any(Date),
          },
        },
      });
      expect(prisma.attempt.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          testId: mockTestId,
          status: AttemptStatus.IN_PROGRESS,
        },
      });
      expect(attempt).toEqual(mockAttemptInProgress);
    });

    it('should throw NotFoundException if the test does not exist', async () => {
      prisma.mockTest.findUnique.mockResolvedValue(null);

      await expect(service.startAttempt(mockUserId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.mockTest.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
        include: { questions: true },
      });
    });

    it('should throw BadRequestException if user has reached daily attempt limit', async () => {
      prisma.mockTest.findUnique.mockResolvedValue(mockTest);
      // Assume limit is 3 attempts per day
      prisma.attempt.count.mockResolvedValue(3);

      await expect(service.startAttempt(mockUserId, mockTestId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.attempt.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          testId: mockTestId,
          startedAt: {
            gte: expect.any(Date),
          },
        },
      });
      expect(prisma.attempt.create).not.toHaveBeenCalled();
    });
  });

  // ==== 2) Submitting answers =============================================
  describe('submitAnswer', () => {
    it('should save an answer when attempt is IN_PROGRESS', async () => {
      prisma.attempt.findUnique.mockResolvedValue(mockAttemptInProgress);
      prisma.answer.upsert.mockResolvedValue({
        id: 'ans-1',
        attemptId: mockAttemptId,
        questionId: 'q1',
        selectedOptionIndex: 1,
      });

      const result = await service.submitAnswer(
        mockAttemptId,
        'q1',
        1, // selectedOptionIndex
      );

      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttemptId },
      });
      expect(prisma.answer.upsert).toHaveBeenCalledWith({
        where: {
          attemptId_questionId: {
            attemptId: mockAttemptId,
            questionId: 'q1',
          },
        },
        update: { selectedOptionIndex: 1 },
        create: {
          attemptId: mockAttemptId,
          questionId: 'q1',
          selectedOptionIndex: 1,
        },
      });
      expect(result.selectedOptionIndex).toBe(1);
    });

    it('should throw NotFoundException if attempt does not exist', async () => {
      prisma.attempt.findUnique.mockResolvedValue(null);

      await expect(
        service.submitAnswer('fake-attempt', 'q1', 0),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: 'fake-attempt' },
      });
    });

    it('should throw BadRequestException if attempt is not IN_PROGRESS', async () => {
      prisma.attempt.findUnique.mockResolvedValue(mockAttemptCompleted); // already completed

      await expect(
        service.submitAnswer(mockAttemptId, 'q1', 0),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttemptId },
      });
      expect(prisma.answer.upsert).not.toHaveBeenCalled();
    });
  });

  // ==== 3) Submitting attempt (score calculation) =========================
  describe('submitAttempt', () => {
    it('should calculate score correctly and mark attempt as COMPLETED', async () => {
      // Simulate answers: q1 correct, q2 correct, q3 wrong, q4 correct, q5 correct
      prisma.attempt.findUnique.mockResolvedValue(mockAttemptInProgress);
      prisma.answer.findMany.mockResolvedValue([
        { questionId: 'q1', selectedOptionIndex: 1, isCorrect: true },
        { questionId: 'q2', selectedOptionIndex: 3, isCorrect: true },
        { questionId: 'q3', selectedOptionIndex: 0, isCorrect: false },
        { questionId: 'q4', selectedOptionIndex: 2, isCorrect: true },
        { questionId: 'q5', selectedOptionIndex: 1, isCorrect: true },
      ]);
      prisma.attempt.update.mockResolvedValue(mockAttemptCompleted);

      const result = await service.submitAttempt(mockAttemptId);

      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttemptId },
        include: { test: { include: { questions: true } } },
      });
      expect(prisma.answer.findMany).toHaveBeenCalledWith({
        where: { attemptId: mockAttemptId },
      });
      expect(prisma.attempt.update).toHaveBeenCalledWith({
        where: { id: mockAttemptId },
        data: {
          status: AttemptStatus.COMPLETED,
          submittedAt: expect.any(Date),
          score: 8, // 4 correct * 2 marks each
        },
      });
      expect(result.score).toBe(8);
      expect(result.status).toBe(AttemptStatus.COMPLETED);
    });

    it('should throw BadRequestException if attempt is not IN_PROGRESS', async () => {
      prisma.attempt.findUnique.mockResolvedValue(mockAttemptCompleted);

      await expect(service.submitAttempt(mockAttemptId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttemptId },
      });
      expect(prisma.attempt.update).not.toHaveBeenCalled();
    });
  });

  // ==== 4) Getting result (questions with correct answers) ================
  describe('getResult', () => {
    it('should return questions with correctness flags for a completed attempt', async () => {
      prisma.attempt.findUnique.mockResolvedValue(mockAttemptCompleted);
      prisma.answer.findMany.mockResolvedValue([
        { questionId: 'q1', selectedOptionIndex: 1, isCorrect: true },
        { questionId: 'q2', selectedOptionIndex: 3, isCorrect: true },
        { questionId: 'q3', selectedOptionIndex: 0, isCorrect: false },
        { questionId: 'q4', selectedOptionIndex: 2, isCorrect: true },
        { questionId: 'q5', selectedOptionIndex: 1, isCorrect: true },
      ]);

      const result = await service.getResult(mockAttemptId);

      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttemptId },
        include: { test: { include: { questions: true } } },
      });
      expect(prisma.answer.findMany).toHaveBeenCalledWith({
        where: { attemptId: mockAttemptId },
      });

      // Structure: each question gets an `isCorrect` flag and the user's selected option
      expect(result.questions).toHaveLength(5);
      expect(result.questions[0]).toMatchObject({
        id: 'q1',
        isCorrect: true,
        selectedOptionIndex: 1,
      });
      expect(result.questions[2]).toMatchObject({
        id: 'q3',
        isCorrect: false,
        selectedOptionIndex: 0,
      });
      expect(result.score).toBe(8);
    });

    it('should throw NotFoundException if attempt does not exist', async () => {
      prisma.attempt.findUnique.mockResolvedValue(null);

      await expect(service.getResult('fake-attempt')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: 'fake-attempt' },
      });
    });

    it('should throw BadRequestException if attempt is not yet completed', async () => {
      prisma.attempt.findUnique.mockResolvedValue(mockAttemptInProgress);

      await expect(service.getResult(mockAttemptId)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.attempt.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttemptId },
      });
    });
  });
});
```

**Explanation of coverage**

| # | Scenario | Test Count |
|---|----------|------------|
| 1 | Starting an attempt – success, test not found, daily limit exceeded | 3 |
| 2 | Submitting an answer – valid IN_PROGRESS, attempt missing, attempt not IN_PROGRESS | 3 |
| 3 | Submitting attempt – correct score calculation, invalid state (not IN_PROGRESS) | 2 |
| 4 | Getting result – completed attempt returns questions with correctness flags, attempt missing, attempt not yet completed | 3 |

Total: **10** unit tests, each targeting a distinct behavior of the Mock Test Engine backend as requested. The tests mock the Prisma client, verify correct repository calls, and assert appropriate DTOs or exceptions.