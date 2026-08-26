import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: {
    auditLog: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      await service.log({ action: 'LOGIN', userId: 'u1', ip: '127.0.0.1' });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'LOGIN',
          userId: 'u1',
          ip: '127.0.0.1',
          userAgent: null,
          method: null,
          url: null,
          status: null,
          duration: null,
          meta: null,
        },
      });
    });

    it('should stringify meta if provided', async () => {
      await service.log({ action: 'VIEW', meta: { jobId: 'j1' } });

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            meta: JSON.stringify({ jobId: 'j1' }),
          }),
        }),
      );
    });
  });

  describe('logAuth', () => {
    it('should call log with auth params', async () => {
      const spy = jest.spyOn(service, 'log');
      await service.logAuth('LOGIN', 'u1', '127.0.0.1');

      expect(spy).toHaveBeenCalledWith({
        action: 'LOGIN',
        userId: 'u1',
        ip: '127.0.0.1',
        meta: undefined,
      });
    });
  });

  describe('logJob', () => {
    it('should call log with job meta', async () => {
      const spy = jest.spyOn(service, 'log');
      await service.logJob('TRACK', 'u1', 'j1');

      expect(spy).toHaveBeenCalledWith({
        action: 'TRACK',
        userId: 'u1',
        meta: { jobId: 'j1' },
      });
    });
  });

  describe('getRecent', () => {
    it('should return recent audit logs', async () => {
      const mockLogs = [{ id: 1, action: 'LOGIN' }, { id: 2, action: 'VIEW' }];
      prisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getRecent();
      expect(result).toEqual(mockLogs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when no logs exist', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);

      const result = await service.getRecent();
      expect(result).toHaveLength(0);
    });

    it('should respect custom limit', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);

      await service.getRecent(10);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('getByUser', () => {
    it('should return logs for a specific user', async () => {
      const mockLogs = [{ id: 1, action: 'LOGIN', userId: 'u1' }];
      prisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getByUser('u1');
      expect(result).toEqual(mockLogs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('getByDateRange', () => {
    it('should return logs within date range', async () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-12-31');
      const mockLogs = [{ id: 1, action: 'LOGIN' }];
      prisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getByDateRange(start, end);
      expect(result).toEqual(mockLogs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
