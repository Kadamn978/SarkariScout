import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogCleanupService {
  private readonly logger = new Logger('LogCleanup');
  private logsDir = path.join(process.cwd(), 'logs');

  async cleanupOldLogs(retentionDays = 90) {
    if (!fs.existsSync(this.logsDir)) return { deleted: 0 };

    const months = fs.readdirSync(this.logsDir);
    let deleted = 0;
    const cutoff = new Date(Date.now() - retentionDays * 86400000);

    for (const month of months) {
      const monthDir = path.join(this.logsDir, month);
      if (!fs.statSync(monthDir).isDirectory()) continue;

      const files = fs.readdirSync(monthDir);
      for (const file of files) {
        const filePath = path.join(monthDir, file);
        const stat = fs.statSync(filePath);
        if (stat.mtime < cutoff) {
          fs.unlinkSync(filePath);
          deleted++;
          this.logger.log(`Deleted old log: ${file}`);
        }
      }

      if (fs.readdirSync(monthDir).length === 0) {
        fs.rmdirSync(monthDir);
      }
    }

    return { deleted, retentionDays };
  }

  getLogStats() {
    if (!fs.existsSync(this.logsDir)) return { months: [], totalFiles: 0, totalSize: 0 };

    const months = fs.readdirSync(this.logsDir);
    let totalFiles = 0, totalSize = 0;
    const result: { month: string; files: { name: string; size: number }[] }[] = [];

    for (const month of months) {
      const monthDir = path.join(this.logsDir, month);
      if (!fs.statSync(monthDir).isDirectory()) continue;

      const files = fs.readdirSync(monthDir).map((f) => {
        const stat = fs.statSync(path.join(monthDir, f));
        totalFiles++;
        totalSize += stat.size;
        return { name: f, size: stat.size };
      });
      result.push({ month, files });
    }

    return { months: result, totalFiles, totalSize };
  }
}
