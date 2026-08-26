import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { AuditService } from '../../common/logger/audit.service';
import { ErrorLogService } from '../../common/logger/error-log.service';
import { LogCleanupService } from '../../common/logger/log-cleanup.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import * as fs from 'fs';

jest.mock('fs');

describe('LogsController', () => {
  let controller: LogsController;
  let auditService: { getRecent: jest.Mock; getByUser: jest.Mock };
  let errorLogService: { getRecentErrors: jest.Mock; getErrorStats: jest.Mock };
  let cleanupService: { getLogStats: jest.Mock; cleanupOldLogs: jest.Mock };

  beforeEach(async () => {
    auditService = { getRecent: jest.fn(), getByUser: jest.fn() };
    errorLogService = { getRecentErrors: jest.fn(), getErrorStats: jest.fn() };
    cleanupService = { getLogStats: jest.fn(), cleanupOldLogs: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        { provide: AuditService, useValue: auditService },
        { provide: ErrorLogService, useValue: errorLogService },
        { provide: LogCleanupService, useValue: cleanupService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LogsController>(LogsController);
  });

  describe('getAuditLogs', () => {
    it('should return audit logs with default limit', async () => {
      const mockLogs = [{ id: 'a1', action: 'LOGIN' }, { id: 'a2', action: 'LOGOUT' }];
      auditService.getRecent.mockResolvedValue(mockLogs);

      const result = await controller.getAuditLogs();
      expect(auditService.getRecent).toHaveBeenCalledWith(50);
      expect(result).toEqual(mockLogs);
    });

    it('should respect custom limit parameter', async () => {
      auditService.getRecent.mockResolvedValue([]);

      await controller.getAuditLogs('10');
      expect(auditService.getRecent).toHaveBeenCalledWith(10);
    });
  });

  describe('getAuditByUser', () => {
    it('should return audit logs for a specific user', async () => {
      const mockLogs = [{ id: 'a1', userId: 'u1', action: 'LOGIN' }];
      auditService.getByUser.mockResolvedValue(mockLogs);

      const result = await controller.getAuditByUser('u1');
      expect(auditService.getByUser).toHaveBeenCalledWith('u1', 50);
      expect(result).toEqual(mockLogs);
    });

    it('should respect custom limit for user audit logs', async () => {
      auditService.getByUser.mockResolvedValue([]);

      await controller.getAuditByUser('u1', '5');
      expect(auditService.getByUser).toHaveBeenCalledWith('u1', 5);
    });
  });

  describe('getErrors', () => {
    it('should return recent errors with default hours', async () => {
      const mockErrors = [{ id: 'e1', level: 'error', message: 'fail' }];
      errorLogService.getRecentErrors.mockResolvedValue(mockErrors);

      const result = await controller.getErrors();
      expect(errorLogService.getRecentErrors).toHaveBeenCalledWith(24);
      expect(result).toEqual(mockErrors);
    });

    it('should respect custom hours parameter', async () => {
      errorLogService.getRecentErrors.mockResolvedValue([]);

      await controller.getErrors('48');
      expect(errorLogService.getRecentErrors).toHaveBeenCalledWith(48);
    });
  });

  describe('getErrorStats', () => {
    it('should return error stats with default hours', async () => {
      const mockStats = { total: 5, byLevel: { warn: 1, error: 3, fatal: 1 }, byUrl: {} };
      errorLogService.getErrorStats.mockResolvedValue(mockStats);

      const result = await controller.getErrorStats();
      expect(errorLogService.getErrorStats).toHaveBeenCalledWith(24);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getLogFiles', () => {
    it('should return log file stats', async () => {
      const mockStats = { totalFiles: 10, totalSize: '5MB' };
      cleanupService.getLogStats.mockResolvedValue(mockStats);

      const result = await controller.getLogFiles();
      expect(result).toEqual(mockStats);
    });
  });

  describe('cleanup', () => {
    it('should run cleanup with default retention', async () => {
      cleanupService.cleanupOldLogs.mockResolvedValue({ deleted: 3 });

      const result = await controller.cleanup();
      expect(cleanupService.cleanupOldLogs).toHaveBeenCalledWith(90);
      expect(result).toEqual({ deleted: 3 });
    });

    it('should respect custom retention parameter', async () => {
      cleanupService.cleanupOldLogs.mockResolvedValue({ deleted: 0 });

      await controller.cleanup('30');
      expect(cleanupService.cleanupOldLogs).toHaveBeenCalledWith(30);
    });
  });

  describe('getLogFile', () => {
    it('should return log file content when file exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('line1\nline2\nline3');

      const result = await controller.getLogFile('2026-01-15');
      expect(result).toEqual({ date: '2026-01-15', lines: ['line1', 'line2', 'line3'] });
    });

    it('should return error when log file not found', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await controller.getLogFile('2026-01-15');
      expect(result).toEqual({ error: 'Log file not found' });
    });
  });
});
