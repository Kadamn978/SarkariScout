import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: {
    pageView: {
      create: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      groupBy: jest.Mock;
    };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      pageView: {
        create: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('trackPageView', () => {
    it('should record a page view with auto-generated visitorId', async () => {
      prisma.pageView.findFirst.mockResolvedValue(null);
      const mockView = {
        id: 'pv1',
        path: '/jobs',
        visitorId: 'generated-id',
        device: 'desktop',
        browser: 'chrome',
        os: 'windows',
        isUnique: true,
      };
      prisma.pageView.create.mockResolvedValue(mockView);

      const result = await service.trackPageView({
        path: '/jobs',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      });

      expect(result).toEqual(mockView);
      expect(result.isUnique).toBe(true);
      expect(prisma.pageView.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            path: '/jobs',
            isUnique: true,
            device: 'desktop',
            browser: 'chrome',
            os: 'windows',
          }),
        }),
      );
    });

    it('should mark as non-unique if same visitor viewed path today', async () => {
      prisma.pageView.findFirst.mockResolvedValue({ id: 'existing' });
      prisma.pageView.create.mockResolvedValue({ id: 'pv2', isUnique: false });

      const result = await service.trackPageView({
        path: '/jobs',
        visitorId: 'v1',
        userAgent: 'Chrome/120',
      });

      expect(result.isUnique).toBe(false);
    });

    it('should parse mobile device from userAgent', async () => {
      prisma.pageView.findFirst.mockResolvedValue(null);
      prisma.pageView.create.mockResolvedValue({ id: 'pv1' });

      await service.trackPageView({
        path: '/jobs',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      });

      expect(prisma.pageView.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            device: 'mobile',
            browser: 'safari',
            os: 'ios',
          }),
        }),
      );
    });

    it('should parse tablet device from userAgent', async () => {
      prisma.pageView.findFirst.mockResolvedValue(null);
      prisma.pageView.create.mockResolvedValue({ id: 'pv1' });

      await service.trackPageView({
        path: '/papers',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0) AppleWebKit/605.1.15 Safari/605.1.15',
      });

      expect(prisma.pageView.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            device: 'tablet',
            browser: 'safari',
            os: 'ios',
          }),
        }),
      );
    });

    it('should handle missing userAgent as unknown', async () => {
      prisma.pageView.findFirst.mockResolvedValue(null);
      prisma.pageView.create.mockResolvedValue({ id: 'pv1' });

      await service.trackPageView({ path: '/jobs' });

      expect(prisma.pageView.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            device: 'unknown',
            browser: 'unknown',
            os: 'unknown',
          }),
        }),
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats with default 7 days', async () => {
      prisma.pageView.count.mockResolvedValue(150);
      prisma.pageView.groupBy
        .mockResolvedValueOnce([{ visitorId: 'v1' }, { visitorId: 'v2' }])
        .mockResolvedValueOnce([{ visitorId: 'v1' }, { visitorId: 'v2' }]);
      prisma.$queryRaw
        .mockResolvedValueOnce([{ date: '2024-01-01', views: 50, uniqueVisitors: 30 }])
        .mockResolvedValueOnce([{ path: '/jobs', views: 80, uniqueVisitors: 45 }])
        .mockResolvedValueOnce([{ device: 'desktop', count: 100 }]);

      const result = await service.getDashboardStats();

      expect(result.totalViews).toBe(150);
      expect(result.uniqueVisitors).toBe(2);
      expect(result.viewsByDay).toHaveLength(1);
      expect(result.topPages).toHaveLength(1);
      expect(result.deviceStats).toHaveLength(1);
    });

    it('should use custom days parameter', async () => {
      prisma.pageView.count.mockResolvedValue(50);
      prisma.pageView.groupBy.mockResolvedValue([]);
      prisma.$queryRaw
        .mockResolvedValue([])
        .mockResolvedValue([])
        .mockResolvedValue([]);

      await service.getDashboardStats(30);

      expect(prisma.pageView.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('getPageStats', () => {
    it('should return page stats for a specific path', async () => {
      prisma.pageView.count.mockResolvedValue(200);
      prisma.pageView.groupBy.mockResolvedValue([{ visitorId: 'v1' }, { visitorId: 'v2' }]);
      prisma.$queryRaw.mockResolvedValue([
        { date: '2024-01-01', views: 100 },
        { date: '2024-01-02', views: 100 },
      ]);

      const result = await service.getPageStats('/jobs');

      expect(result.path).toBe('/jobs');
      expect(result.totalViews).toBe(200);
      expect(result.uniqueVisitors).toBe(2);
      expect(result.viewsByDay).toHaveLength(2);
    });

    it('should use custom days parameter', async () => {
      prisma.pageView.count.mockResolvedValue(0);
      prisma.pageView.groupBy.mockResolvedValue([]);
      prisma.$queryRaw.mockResolvedValue([]);

      await service.getPageStats('/papers', 60);

      expect(prisma.pageView.count).toHaveBeenCalled();
    });
  });
});
