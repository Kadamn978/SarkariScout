import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BugStatus } from '@prisma/client';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let prisma: {
    bugReport: {
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      bugReport: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  describe('createBugReport', () => {
    it('should create a bug report with all fields', async () => {
      const mockReport = {
        id: 'br1',
        userId: 'u1',
        title: 'Login broken',
        description: 'Cannot login',
        category: 'bug',
        priority: 'high',
        status: 'OPEN',
        createdAt: new Date(),
      };
      prisma.bugReport.create.mockResolvedValue(mockReport);

      const result = await service.createBugReport('u1', 'Login broken', 'Cannot login', 'bug', 'high');
      expect(result).toEqual(mockReport);
      expect(prisma.bugReport.create).toHaveBeenCalledWith({
        data: { userId: 'u1', title: 'Login broken', description: 'Cannot login', category: 'bug', priority: 'high' },
      });
    });

    it('should create a bug report with default category and priority', async () => {
      const mockReport = { id: 'br2', userId: 'u1', title: 'Issue', description: 'Desc', category: 'bug', priority: 'medium' };
      prisma.bugReport.create.mockResolvedValue(mockReport);

      const result = await service.createBugReport('u1', 'Issue', 'Desc');
      expect(result).toEqual(mockReport);
      expect(prisma.bugReport.create).toHaveBeenCalledWith({
        data: { userId: 'u1', title: 'Issue', description: 'Desc', category: 'bug', priority: 'medium' },
      });
    });

    it('should create a bug report with null userId', async () => {
      const mockReport = { id: 'br3', userId: null, title: 'Anon', description: 'Report', category: 'bug', priority: 'medium' };
      prisma.bugReport.create.mockResolvedValue(mockReport);

      const result = await service.createBugReport(null, 'Anon', 'Report');
      expect(result).toEqual(mockReport);
      expect(prisma.bugReport.create).toHaveBeenCalledWith({
        data: { userId: null, title: 'Anon', description: 'Report', category: 'bug', priority: 'medium' },
      });
    });
  });

  describe('getMyBugReports', () => {
    it('should return bug reports for a user', async () => {
      const mockReports = [
        { id: 'br1', userId: 'u1', title: 'Report 1', status: 'OPEN' },
        { id: 'br2', userId: 'u1', title: 'Report 2', status: 'RESOLVED' },
      ];
      prisma.bugReport.findMany.mockResolvedValue(mockReports);

      const result = await service.getMyBugReports('u1');
      expect(result).toHaveLength(2);
      expect(prisma.bugReport.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when user has no reports', async () => {
      prisma.bugReport.findMany.mockResolvedValue([]);

      const result = await service.getMyBugReports('u_no_reports');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllBugReports', () => {
    it('should return all bug reports without status filter', async () => {
      const mockReports = [
        { id: 'br1', status: 'OPEN' },
        { id: 'br2', status: 'RESOLVED' },
      ];
      prisma.bugReport.findMany.mockResolvedValue(mockReports);

      const result = await service.getAllBugReports();
      expect(result).toHaveLength(2);
      expect(prisma.bugReport.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should filter by status when provided', async () => {
      const mockReports = [{ id: 'br1', status: 'OPEN' }];
      prisma.bugReport.findMany.mockResolvedValue(mockReports);

      const result = await service.getAllBugReports('OPEN' as BugStatus);
      expect(result).toHaveLength(1);
      expect(prisma.bugReport.findMany).toHaveBeenCalledWith({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should return empty when no reports match status filter', async () => {
      prisma.bugReport.findMany.mockResolvedValue([]);

      const result = await service.getAllBugReports('RESOLVED' as BugStatus);
      expect(result).toHaveLength(0);
    });
  });

  describe('updateBugStatus', () => {
    it('should update bug status without admin notes', async () => {
      const mockUpdated = { id: 'br1', status: 'IN_PROGRESS' };
      prisma.bugReport.update.mockResolvedValue(mockUpdated);

      const result = await service.updateBugStatus('br1', 'IN_PROGRESS' as BugStatus);
      expect(result).toEqual(mockUpdated);
      expect(prisma.bugReport.update).toHaveBeenCalledWith({
        where: { id: 'br1' },
        data: { status: 'IN_PROGRESS' },
      });
    });

    it('should set resolvedAt when status is RESOLVED', async () => {
      const mockUpdated = { id: 'br1', status: 'RESOLVED', resolvedAt: new Date() };
      prisma.bugReport.update.mockResolvedValue(mockUpdated);

      await service.updateBugStatus('br1', 'RESOLVED' as BugStatus, 'Fixed');
      expect(prisma.bugReport.update).toHaveBeenCalledWith({
        where: { id: 'br1' },
        data: {
          status: 'RESOLVED',
          adminNotes: 'Fixed',
          resolvedAt: expect.any(Date),
        },
      });
    });
  });
});
