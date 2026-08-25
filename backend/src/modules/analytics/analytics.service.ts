import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackPageView(data: {
    path: string;
    visitorId?: string;
    userAgent?: string;
    referrer?: string;
    sessionId?: string;
  }) {
    const visitorId = data.visitorId || this.generateVisitorId();
    const device = this.parseDevice(data.userAgent);
    const browser = this.parseBrowser(data.userAgent);
    const os = this.parseOS(data.userAgent);

    const existingToday = await this.prisma.pageView.findFirst({
      where: {
        visitorId,
        path: data.path,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const isUnique = !existingToday;

    return this.prisma.pageView.create({
      data: {
        path: data.path,
        visitorId,
        userAgent: data.userAgent,
        referrer: data.referrer,
        device,
        browser,
        os,
        isUnique,
        sessionId: data.sessionId,
      },
    });
  }

  async getDashboardStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalViews, uniqueVisitors, viewsByDay, topPages, deviceStats] =
      await Promise.all([
        this.prisma.pageView.count({
          where: { createdAt: { gte: startDate } },
        }),
        this.prisma.pageView.groupBy({
          by: ['visitorId'],
          where: { createdAt: { gte: startDate } },
        }),
        this.prisma.$queryRaw`
          SELECT DATE(createdAt) as date, COUNT(*) as views, COUNT(DISTINCT visitorId) as uniqueVisitors
          FROM page_views
          WHERE createdAt >= ${startDate}
          GROUP BY DATE(createdAt)
          ORDER BY date DESC
        `,
        this.prisma.$queryRaw`
          SELECT path, COUNT(*) as views, COUNT(DISTINCT visitorId) as uniqueVisitors
          FROM page_views
          WHERE createdAt >= ${startDate}
          GROUP BY path
          ORDER BY views DESC
          LIMIT 10
        `,
        this.prisma.$queryRaw`
          SELECT device, COUNT(*) as count
          FROM page_views
          WHERE createdAt >= ${startDate}
          GROUP BY device
          ORDER BY count DESC
        `,
      ]);

    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      viewsByDay,
      topPages,
      deviceStats,
    };
  }

  async getPageStats(path: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalViews, uniqueVisitors, viewsByDay] = await Promise.all([
      this.prisma.pageView.count({
        where: { path, createdAt: { gte: startDate } },
      }),
      this.prisma.pageView.groupBy({
        by: ['visitorId'],
        where: { path, createdAt: { gte: startDate } },
      }),
      this.prisma.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as views
        FROM page_views
        WHERE path = ${path} AND createdAt >= ${startDate}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
      `,
    ]);

    return {
      path,
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      viewsByDay,
    };
  }

  private generateVisitorId(userAgent?: string, ip?: string): string {
    return crypto.randomUUID();
  }

  private parseDevice(ua?: string): string {
    if (!ua) return 'unknown';
    if (/mobile|android|iphone/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private parseBrowser(ua?: string): string {
    if (!ua) return 'unknown';
    if (/chrome/i.test(ua)) return 'chrome';
    if (/firefox/i.test(ua)) return 'firefox';
    if (/safari/i.test(ua)) return 'safari';
    if (/edge/i.test(ua)) return 'edge';
    return 'other';
  }

  private parseOS(ua?: string): string {
    if (!ua) return 'unknown';
    if (/windows/i.test(ua)) return 'windows';
    if (/mac os/i.test(ua)) return 'macos';
    if (/linux/i.test(ua)) return 'linux';
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad/i.test(ua)) return 'ios';
    return 'other';
  }
}
