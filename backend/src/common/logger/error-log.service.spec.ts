import { Test, TestingModule } from '@nestjs/testing';
import { ErrorLogService } from './error-log.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ErrorLogService', () => {
  let service: ErrorLogService;
  let prisma: {
    errorLog: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      errorLog: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ErrorLogService>(ErrorLogService);
  });

  describe('logError', () => {
    it('should create an error log entry', async () => {
      await service.logError({
        level: 'error',
        message: 'Something failed',
        stack: 'Error at line 10',
        method: 'POST',
        url: '/api/jobs',
        status: 500,
        userId: 'u1',
      });

      expect(prisma.errorLog.create).toHaveBeenCalledWith({
        data: {
          level: 'error',
          message: 'Something failed',
          stack: 'Error at line 10',
          method: 'POST',
          url: '/api/jobs',
          status: 500,
          userId: 'u1',
          ip: null,
          userAgent: null,
          causedBy: null,
          meta: null,
        },
      });
    });

    it('should stringify meta if provided', async () => {
      await service.logError({
        level: 'warn',
        message: 'Rate limit',
        meta: { remaining: 10 },
      });

      expect(prisma.errorLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            meta: JSON.stringify({ remaining: 10 }),
          }),
        }),
      );
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors within time window', async () => {
      const mockErrors = [
        { id: 1, level: 'error', message: 'Failed' },
        { id: 2, level: 'warn', message: 'Slow' },
      ];
      prisma.errorLog.findMany.mockResolvedValue(mockErrors);

      const result = await service.getRecentErrors(24, 100);
      expect(result).toEqual(mockErrors);
      expect(prisma.errorLog.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no errors exist', async () => {
      prisma.errorLog.findMany.mockResolvedValue([]);

      const result = await service.getRecentErrors();
      expect(result).toHaveLength(0);
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', async () => {
      const mockErrors = [
        { level: 'error', url: '/api/jobs', status: 500, message: 'Failed', createdAt: new Date() },
        { level: 'warn', url: '/api/jobs', status: 429, message: 'Slow', createdAt: new Date() },
        { level: 'fatal', url: '/api/auth', status: 500, message: 'Crash', createdAt: new Date() },
      ];
      prisma.errorLog.findMany.mockResolvedValue(mockErrors);

      const result = await service.getErrorStats(24);

      expect(result.total).toBe(3);
      expect(result.byLevel).toEqual({ warn: 1, error: 1, fatal: 1 });
      expect(result.byUrl).toEqual({
        '/api/jobs': 2,
        '/api/auth': 1,
      });
      expect(result.since).toBeInstanceOf(Date);
    });

    it('should handle empty error list', async () => {
      prisma.errorLog.findMany.mockResolvedValue([]);

      const result = await service.getErrorStats();

      expect(result.total).toBe(0);
      expect(result.byLevel).toEqual({ warn: 0, error: 0, fatal: 0 });
      expect(result.byUrl).toEqual({});
    });

    it('should group unknown URLs correctly', async () => {
      const mockErrors = [
        { level: 'error', url: null, status: 500, message: 'Failed', createdAt: new Date() },
      ];
      prisma.errorLog.findMany.mockResolvedValue(mockErrors);

      const result = await service.getErrorStats(24);

      expect(result.byUrl).toEqual({ unknown: 1 });
    });
  });
});
