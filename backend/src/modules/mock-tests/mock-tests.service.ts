import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MockQuestion } from '@prisma/client';

@Injectable()
export class MockTestsService {
  private readonly logger = new Logger(MockTestsService.name);
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { examFamily?: string; qualification?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isPublished: true };
    if (filters?.examFamily) where.examFamily = filters.examFamily;
    if (filters?.qualification) where.qualification = filters.qualification;

    const [tests, total] = await Promise.all([
      this.prisma.mockTest.findMany({
        where,
        select: {
          id: true, title: true, description: true, examFamily: true,
          qualification: true, totalQuestions: true, totalMarks: true,
          durationMinutes: true, createdAt: true,
          _count: { select: { attempts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.mockTest.count({ where }),
    ]);

    return {
      tests: tests.map((t) => ({ ...t, attemptCount: t._count.attempts })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const test = await this.prisma.mockTest.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { attempts: true } },
      },
    });
    if (!test) throw new NotFoundException('Mock test not found');
    return test;
  }

  async startAttempt(userId: string, testId: string) {
    const test = await this.prisma.mockTest.findUnique({ where: { id: testId } });
    if (!test || !test.isPublished) throw new NotFoundException('Test not found or not published');

    const existingAttempt = await this.prisma.mockTestAttempt.findFirst({
      where: { userId, testId, score: null },
    });
    if (existingAttempt) return existingAttempt;

    return this.prisma.mockTestAttempt.create({
      data: { testId, userId },
    });
  }

  async submitAttempt(userId: string, attemptId: string, answers: Record<string, string>, timeTakenSec: number) {
    const attempt = await this.prisma.mockTestAttempt.findUnique({
      where: { id: attemptId },
      include: { test: { include: { questions: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new NotFoundException('Unauthorized');
    if (attempt.score !== null) throw new NotFoundException('Attempt already submitted');

    let correctCount = 0;
    let totalScore = 0;
    const questions = attempt.test.questions;

    for (const q of questions) {
      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer === q.correctOption) {
        correctCount++;
        totalScore += q.marks;
      }
    }

    const updated = await this.prisma.mockTestAttempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
        totalAnswered: Object.keys(answers).length,
        correctCount,
        timeTakenSec,
        answers: JSON.stringify(answers),
      },
    });

    return {
      ...updated,
      totalQuestions: questions.length,
      totalMarks: questions.reduce((sum: number, q: MockQuestion) => sum + q.marks, 0),
      percentage: Math.round((totalScore / questions.reduce((sum: number, q: MockQuestion) => sum + q.marks, 0)) * 100),
    };
  }

  async getAttemptDetail(userId: string, attemptId: string) {
    const attempt = await this.prisma.mockTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: { questions: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
    if (!attempt || attempt.userId !== userId) throw new NotFoundException('Attempt not found');

    const answers = attempt.answers ? JSON.parse(attempt.answers) : {};
    const questions = attempt.test.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      explanation: q.explanation,
      marks: q.marks,
      userAnswer: answers[q.id] || null,
      isCorrect: answers[q.id] === q.correctOption,
    }));

    return { ...attempt, questions };
  }

  async getUserStats(userId: string) {
    const attempts = await this.prisma.mockTestAttempt.findMany({
      where: { userId, score: { not: null } },
      include: { test: { select: { title: true, examFamily: true, totalMarks: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts
      : 0;
    const avgPercentage = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + ((a.score || 0) / (a.test.totalMarks || 1)) * 100, 0) / totalAttempts
      : 0;

    return {
      totalAttempts,
      avgScore: Math.round(avgScore),
      avgPercentage: Math.round(avgPercentage),
      bestScore: attempts.length > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : 0,
      recentAttempts: attempts.slice(0, 10).map((a) => ({
        id: a.id,
        testTitle: a.test.title,
        examFamily: a.test.examFamily,
        score: a.score,
        totalMarks: a.test.totalMarks,
        percentage: Math.round(((a.score || 0) / (a.test.totalMarks || 1)) * 100),
        timeTakenSec: a.timeTakenSec,
        createdAt: a.createdAt,
      })),
    };
  }

  async getLeaderboard(testId: string, limit = 20) {
    return this.prisma.mockTestAttempt.findMany({
      where: { testId, score: { not: null } },
      include: { user: { select: { name: true } } },
      orderBy: [{ score: 'desc' }, { timeTakenSec: 'asc' }],
      take: limit,
    });
  }

  async createTest(data: {
    title: string; description?: string; examFamily: string;
    qualification?: string; totalQuestions: number; totalMarks: number;
    durationMinutes: number;
  }) {
    return this.prisma.mockTest.create({ data });
  }

  async addQuestion(testId: string, data: {
    questionText: string; optionA: string; optionB: string;
    optionC: string; optionD: string; correctOption: string;
    explanation?: string; marks?: number; sortOrder?: number;
  }) {
    return this.prisma.mockQuestion.create({ data: { testId, ...data } });
  }

  async publishTest(id: string) {
    return this.prisma.mockTest.update({ where: { id }, data: { isPublished: true } });
  }
}
