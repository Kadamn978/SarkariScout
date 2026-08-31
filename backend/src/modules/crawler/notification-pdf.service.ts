import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

@Injectable()
export class NotificationPdfService {
  private readonly logger = new Logger(NotificationPdfService.name);
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  private readonly MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB limit

  constructor(private prisma: PrismaService) {}

  async downloadAndStorePdf(
    jobId: string,
    pdfUrl: string,
    competitorId?: string,
  ): Promise<{ success: boolean; size?: number; error?: string }> {
    try {
      const existing = await this.prisma.jobNotification.findFirst({
        where: { jobId, isPurged: false },
      });
      if (existing) {
        return { success: true, size: existing.pdfSizeBytes || 0 };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(pdfUrl, {
        headers: { 'User-Agent': this.USER_AGENT },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
        return { success: false, error: `Not a PDF: ${contentType}` };
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > this.MAX_PDF_SIZE) {
        return { success: false, error: `PDF too large: ${buffer.length} bytes` };
      }

      const compressed = await gzip(buffer);
      const job = await this.prisma.job.findUnique({ where: { id: jobId } });

      await this.prisma.jobNotification.create({
        data: {
          jobId,
          competitorId: competitorId || null,
          title: job?.title || 'Unknown',
          officialUrl: pdfUrl,
          pdfData: compressed,
          pdfSizeBytes: compressed.length,
          pdfCompressed: true,
          uploadStatus: 'completed',
        },
      });

      await this.prisma.job.update({
        where: { id: jobId },
        data: { notificationPdfUrl: pdfUrl },
      });

      this.logger.log(`Stored PDF for job ${jobId}: ${buffer.length} bytes → ${compressed.length} bytes compressed`);
      return { success: true, size: compressed.length };
    } catch (err) {
      this.logger.error(`Failed to download PDF for job ${jobId}: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  }

  async getPdfData(notificationId: string): Promise<Buffer | null> {
    try {
      const notification = await this.prisma.jobNotification.findUnique({
        where: { id: notificationId },
      });
      if (!notification || !notification.pdfData || notification.isPurged) return null;
      if (notification.pdfCompressed) {
        return await gunzip(Buffer.from(notification.pdfData));
      }
      return Buffer.from(notification.pdfData);
    } catch (err) {
      this.logger.error(`Failed to get PDF ${notificationId}: ${(err as Error).message}`);
      return null;
    }
  }

  async markResultDeclared(jobId: string): Promise<void> {
    const now = new Date();
    const purgeDate = new Date(now.getTime() + 90 * 86400000);

    await this.prisma.jobNotification.updateMany({
      where: { jobId, isPurged: false },
      data: {
        resultDeclaredAt: now,
        purgeAfterAt: purgeDate,
      },
    });

    this.logger.log(`Marked result for job ${jobId}, purge scheduled at ${purgeDate.toISOString()}`);
  }

  async purgeExpiredPdfs(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.jobNotification.updateMany({
      where: {
        isPurged: false,
        purgeAfterAt: { not: null, lt: now },
      },
      data: {
        pdfData: null,
        pdfSizeBytes: 0,
        isPurged: true,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Purged ${result.count} expired notification PDFs`);
    }
    return result.count;
  }

  async getNotificationForJob(jobId: string) {
    return this.prisma.jobNotification.findFirst({
      where: { jobId },
      select: {
        id: true,
        title: true,
        officialUrl: true,
        pdfSizeBytes: true,
        pdfCompressed: true,
        uploadStatus: true,
        isPurged: true,
        resultDeclaredAt: true,
        createdAt: true,
      },
    });
  }

  async rescrapeJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return { success: false, error: 'Job not found' };

    const pdfUrl = job.notificationPdfUrl || job.officialNotificationUrl || job.sourceUrl;
    if (!pdfUrl) return { success: false, error: 'No URL to rescrape' };

    const result = await this.downloadAndStorePdf(jobId, pdfUrl);
    return result;
  }
}
