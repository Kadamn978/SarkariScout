import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getISTHour } from './shared-utils';

export interface ScrapeWindow {
  label: string;
  intervalMs: number;
  startHour: number;
  endHour: number;
}

@Injectable()
export class AdaptiveSchedulerService {
  private readonly logger = new Logger(AdaptiveSchedulerService.name);

  // Peak hours (10am-2pm IST): scrape every hour
  // Afternoon (2pm-10pm IST): scrape every 2-3 hours
  // Night (10pm-10am IST): scrape every 4-5 hours
  private readonly windows: ScrapeWindow[] = [
    { label: 'peak',      intervalMs: 1 * 60 * 60 * 1000,    startHour: 10, endHour: 14 },
    { label: 'afternoon', intervalMs: 2.5 * 60 * 60 * 1000,  startHour: 14, endHour: 22 },
    { label: 'night',     intervalMs: 5 * 60 * 60 * 1000,    startHour: 22, endHour: 10 },
  ];

  private sourceLastRun: Map<string, number> = new Map();
  private cachedInterval: Map<string, number> = new Map();
  private lastWindowLabel: string = '';

  constructor(private prisma: PrismaService) {}

  getCurrentWindow(): ScrapeWindow {
    const hour = getISTHour();
    for (const w of this.windows) {
      if (w.startHour < w.endHour) {
        if (hour >= w.startHour && hour < w.endHour) return w;
      } else {
        if (hour >= w.startHour || hour < w.endHour) return w;
      }
    }
    return this.windows[2]; // default to night
  }

  getIntervalForSource(sourceId: string): number {
    const window = this.getCurrentWindow();

    // Recalculate intervals only when window changes
    if (window.label !== this.lastWindowLabel) {
      this.cachedInterval.clear();
      this.lastWindowLabel = window.label;
    }

    // Return cached interval if available
    const cached = this.cachedInterval.get(sourceId);
    if (cached !== undefined) return cached;

    // Calculate new interval with jitter
    const baseInterval = window.intervalMs;
    const jitter = baseInterval * 0.2 * (Math.random() - 0.5);
    const interval = Math.round(baseInterval + jitter);

    this.cachedInterval.set(sourceId, interval);
    return interval;
  }

  shouldCrawl(sourceId: string): boolean {
    const lastRun = this.sourceLastRun.get(sourceId) || 0;
    const interval = this.getIntervalForSource(sourceId);
    const now = Date.now();
    return (now - lastRun) >= interval;
  }

  markCrawled(sourceId: string): void {
    this.sourceLastRun.set(sourceId, Date.now());
  }

  getNextCrawlTime(sourceId: string): Date {
    const lastRun = this.sourceLastRun.get(sourceId) || 0;
    const interval = this.getIntervalForSource(sourceId);
    return new Date(lastRun + interval);
  }

  // Clean up entries for sources no longer in the database
  async cleanupStaleEntries(): Promise<void> {
    const sources = await this.prisma.source.findMany({ select: { id: true } });
    const activeIds = new Set(sources.map((s) => s.id));

    for (const key of this.sourceLastRun.keys()) {
      if (!activeIds.has(key)) {
        this.sourceLastRun.delete(key);
        this.cachedInterval.delete(key);
      }
    }
  }

  getStatus(): { window: string; interval: string; hour: number; sources: Record<string, string> } {
    const window = this.getCurrentWindow();
    const hour = getISTHour();
    const sources: Record<string, string> = {};

    this.cachedInterval.forEach((interval, sourceId) => {
      const nextRun = this.getNextCrawlTime(sourceId);
      sources[sourceId] = `interval=${Math.round(interval / 60000)}min, next=${nextRun.toISOString()}`;
    });

    return {
      window: window.label,
      interval: `${Math.round(window.intervalMs / 60000)}min`,
      hour,
      sources,
    };
  }
}
