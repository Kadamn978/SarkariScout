import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { escapeHtml, sanitizeEmailSubject, maskEmail } from '../crawler/url-validator';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private baseUrl: string;

  constructor(private prisma: PrismaService) {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log('SMTP transporter configured');
    } else {
      this.logger.warn('No SMTP configured — emails will be logged only');
    }
    this.baseUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173';
  }

  async sendDailyDigest() {
    const prefs = await this.prisma.emailPreference.findMany({
      where: { digestEnabled: true, unsubscribedAt: null },
      include: { user: { include: { profile: true } } },
    });

    // Fetch all open jobs ONCE (not per user)
    const allJobs = await this.prisma.job.findMany({
      where: { status: 'OPEN', applyEnd: { gte: new Date() } },
      orderBy: { applyEnd: 'asc' },
      take: 500,
      select: { id: true, title: true, org: true, state: true, totalVacancies: true, applyEnd: true },
    });

    let sent = 0, failed = 0;
    const notifications: { userId: string; subject: string }[] = [];

    for (const pref of prefs) {
      try {
        const user = pref.user;
        const profile = user?.profile;
        if (!profile) continue;
        if (!user?.emailVerifiedAt) continue;

        // Filter jobs in memory instead of querying DB per user
        const matchingJobs = allJobs.filter((job) => {
          if (job.state !== 'ALL_IN' && profile.state && job.state !== profile.state) return false;
          return true;
        });

        if (matchingJobs.length === 0) continue;

        const userEmail = pref.user?.email;
        if (!userEmail) continue;

        const result = await this.sendEmail({
          to: userEmail,
          subject: sanitizeEmailSubject(`SarkariScout Daily Digest: ${matchingJobs.length} new jobs for you`),
          html: this.buildDigestHtml(matchingJobs, profile, pref.unsubscribeToken),
        });

        if (result) {
          sent++;
          notifications.push({ userId: pref.userId, subject: `Daily Digest: ${matchingJobs.length} jobs` });
        } else {
          failed++;
        }
      } catch (e) {
        this.logger.error(`Digest failed for user ${pref.userId}: ${(e as Error).message}`);
        failed++;
      }
    }

    // Batch insert notification logs
    if (notifications.length > 0) {
      await this.prisma.notificationLog.createMany({
        data: notifications.map(n => ({
          userId: n.userId,
          type: 'DIGEST' as const,
          subject: n.subject,
        })),
      });
    }

    return { sent, failed, total: prefs.length };
  }

  async sendInstantAlert(userId: string, jobId: string, changeType?: string) {
    // Single query with nested includes
    const [pref, job] = await Promise.all([
      this.prisma.emailPreference.findUnique({
        where: { userId },
        include: { user: { include: { profile: true } } },
      }),
      this.prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!pref || pref.unsubscribedAt) return false;
    if (!pref.user?.profile?.notifyInstant && !pref.instantEnabled) return false;
    if (!pref.user?.emailVerifiedAt) return false;
    if (!pref.user?.email) return false;
    if (!job) return false;

    const subject = changeType
      ? sanitizeEmailSubject(`SarkariScout Alert: ${job.title} at ${job.org} — ${changeType}`)
      : sanitizeEmailSubject(`SarkariScout: New matching job — ${job.title} at ${job.org}`);

    const unsubToken = pref.unsubscribeToken || '';

    const result = await this.sendEmail({
      to: pref.user.email,
      subject,
      html: this.buildAlertHtml(job, changeType, unsubToken),
    });

    if (result) {
      await this.prisma.notificationLog.create({
        data: {
          userId, jobId,
          type: changeType ? 'CHANGE_ALERT' : 'INSTANT',
          subject,
        },
      });
    }

    return result;
  }

  async sendWelcomeEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const pref = await this.prisma.emailPreference.findUnique({ where: { userId } });

    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to SarkariScout!',
      html: this.buildWelcomeHtml(user.name || 'Candidate', pref?.unsubscribeToken || ''),
    });
  }

  async sendVerificationEmail(userId: string, email: string, token: string) {
    await this.sendEmail({
      to: email,
      subject: 'Verify your SarkariScout account',
      html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <p><a href="${this.baseUrl}/verify-email?token=${token}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.sendEmail({
      to: email,
      subject: 'Reset your SarkariScout password',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${this.baseUrl}/reset-password?token=${token}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
  }

  async sendJobDeletionNotice(email: string, name: string, jobTitle: string, org: string) {
    await this.sendEmail({
      to: email,
      subject: sanitizeEmailSubject(`Job Removed: ${jobTitle}`),
      html: `
        <h2>Job Listing Removed</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>A job you were tracking has been <strong>removed from the official source</strong>:</p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:16px 0;border-radius:4px">
          <p style="margin:0"><strong>${escapeHtml(jobTitle)}</strong></p>
          <p style="margin:4px 0 0 0;color:#666">${escapeHtml(org)}</p>
        </div>
        <p>This usually means the application deadline has passed, the notification has been withdrawn, or the listing was temporary.</p>
        <p><strong>What to do:</strong></p>
        <ul>
          <li>Visit the <a href="${this.baseUrl}/jobs">official source</a> to confirm</li>
          <li>If you believe this is an error, <a href="${this.baseUrl}/feedback">contact support</a></li>
          <li>You can also <a href="${this.baseUrl}/feedback">raise a bug report</a></li>
        </ul>
        <p>We automatically track job listings and notify you when they change.</p>
      `,
    });
  }

  async sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
    this.logger.log(`Email to ${maskEmail(opts.to)}: ${opts.subject}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM || `SarkariScout <${process.env.SMTP_USER || 'sarkariscout+noreply@gmail.com'}>`,
          to: opts.to,
          subject: opts.subject,
          html: opts.html,
        });
        this.logger.log(`Email sent to ${maskEmail(opts.to)}`);
        return true;
      } catch (err) {
        this.logger.error(`Email send failed: ${(err as Error).message}`);
        return false;
      }
    } else {
      this.logger.log(`[DRY RUN] Email to ${maskEmail(opts.to)}: ${opts.subject}`);
      return true;
    }
  }

  async unsubscribe(token: string): Promise<{ success: boolean; message: string }> {
    const pref = await this.prisma.emailPreference.findUnique({
      where: { unsubscribeToken: token },
    });
    if (!pref) return { success: false, message: 'Invalid unsubscribe link' };

    await this.prisma.emailPreference.update({
      where: { id: pref.id },
      data: {
        digestEnabled: false,
        instantEnabled: false,
        weeklyEnabled: false,
        unsubscribedAt: new Date(),
      },
    });

    return { success: true, message: 'Successfully unsubscribed' };
  }

  async getPreferences(userId: string) {
    return this.prisma.emailPreference.findUnique({ where: { userId } });
  }

  async updatePreferences(userId: string, data: { digestEnabled?: boolean; instantEnabled?: boolean; weeklyEnabled?: boolean }) {
    return this.prisma.emailPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async getNotificationHistory(userId: string, limit = 20) {
    return this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      include: { job: { select: { title: true, org: true } } },
    });
  }

  private buildDigestHtml(jobs: any[], profile: any, unsubToken: string): string {
    const jobRows = jobs.slice(0, 20).map((j) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb">
          <a href="${this.baseUrl}/jobs/${encodeURIComponent(j.id)}" style="color:#1d4ed8;font-weight:600;text-decoration:none;font-size:15px">${escapeHtml(j.title)}</a>
          <br/>
          <span style="color:#6b7280;font-size:13px">${escapeHtml(j.org)}</span>
          <br/>
          <span style="color:#6b7280;font-size:12px">
            ${j.state === 'ALL_IN' ? 'All India' : escapeHtml(j.state)}
            ${j.totalVacancies ? ` | ${j.totalVacancies} vacancies` : ''}
            ${j.applyEnd ? ` | Deadline: ${new Date(j.applyEnd).toLocaleDateString('en-IN')}` : ''}
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:system-ui,-apple-system,sans-serif;margin:0;padding:20px;background:#f9fafb">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#2563eb,#1e40af);padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">SarkariScout Daily Digest</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px">${jobs.length} jobs match your profile</p>
          </div>
          <div style="padding:20px">
            <table style="width:100%;border-collapse:collapse">${jobRows}</table>
          </div>
          <div style="padding:20px;background:#f0f9ff;text-align:center;border-top:2px solid #2563eb">
            <p style="color:#374151;font-size:14px;margin:0 0 12px">Login to your SarkariScout dashboard for full details, eligibility check, and one-click apply.</p>
            <a href="${this.baseUrl}/dashboard" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">Login to Dashboard</a>
          </div>
          <div style="padding:16px 20px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb">
            <a href="${this.baseUrl}/jobs" style="color:#2563eb;text-decoration:none;font-weight:600">Browse All Jobs on SarkariScout →</a>
          </div>
          <div style="padding:12px 20px;background:#f3f4f6;text-align:center">
            <a href="${this.baseUrl}/unsubscribe?token=${unsubToken}" style="color:#9ca3af;font-size:11px;text-decoration:none">Unsubscribe</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildAlertHtml(job: any, changeType?: string, unsubToken?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:system-ui,-apple-system,sans-serif;margin:0;padding:20px;background:#f9fafb">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <div style="background:${changeType ? '#dc2626' : '#2563eb'};padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:20px">${changeType ? 'Job Update Alert' : 'New Job Match Found'}</h1>
          </div>
          <div style="padding:24px">
            <h2 style="margin:0 0 8px;font-size:18px;color:#111827">${escapeHtml(job.title)}</h2>
            <p style="color:#6b7280;margin:0 0 16px">${escapeHtml(job.org)}</p>
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;width:120px">State</td><td>${job.state === 'ALL_IN' ? 'All India' : escapeHtml(job.state)}</td></tr>
              ${job.totalVacancies ? `<tr><td style="padding:8px 0;color:#6b7280">Vacancies</td><td>${job.totalVacancies}</td></tr>` : ''}
              ${job.applyEnd ? `<tr><td style="padding:8px 0;color:#6b7280">Deadline</td><td>${new Date(job.applyEnd).toLocaleDateString('en-IN')}</td></tr>` : ''}
              ${changeType ? `<tr><td style="padding:8px 0;color:#6b7280">Change</td><td style="color:#dc2626;font-weight:600">${escapeHtml(changeType)}</td></tr>` : ''}
            </table>
            <div style="margin-top:24px;text-align:center">
              <p style="color:#374151;font-size:14px;margin:0 0 12px">Login to your SarkariScout dashboard to view full eligibility, deadline countdown, and one-click apply.</p>
              <a href="${this.baseUrl}/dashboard" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">Login to Dashboard</a>
            </div>
            <div style="margin-top:16px;text-align:center">
              <a href="${this.baseUrl}/jobs/${encodeURIComponent(job.id)}" style="color:#2563eb;text-decoration:none;font-size:14px">View Job Details on SarkariScout →</a>
            </div>
          </div>
          ${unsubToken ? `<div style="padding:12px 20px;background:#f3f4f6;text-align:center">
            <a href="${this.baseUrl}/unsubscribe?token=${unsubToken}" style="color:#9ca3af;font-size:11px;text-decoration:none">Unsubscribe</a>
          </div>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  async getNotificationLog(userId: string, limit = 50) {
    return this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        channel: true,
        subject: true,
        sentAt: true,
        status: true,
        openedAt: true,
        clickedAt: true,
        jobId: true,
      },
    });
  }

  private buildWelcomeHtml(name: string, unsubToken: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:system-ui,-apple-system,sans-serif;margin:0;padding:20px;background:#f9fafb">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#2563eb,#1e40af);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">Welcome to SarkariScout!</h1>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;color:#374151">Hi ${escapeHtml(name)},</p>
            <p style="color:#6b7280;line-height:1.6">You're all set! SarkariScout will help you find the latest government job notifications, track deadlines, and get alerts for jobs that match your profile.</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${this.baseUrl}/login" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">Login to Dashboard</a>
            </div>
            <p style="color:#6b7280;font-size:14px;line-height:1.6">
              <strong>Quick Links:</strong><br/>
              • <a href="${this.baseUrl}/profile" style="color:#2563eb">Complete your profile</a> for better job matches<br/>
              • <a href="${this.baseUrl}/documents" style="color:#2563eb">Upload documents</a> for easy access<br/>
              • <a href="${this.baseUrl}/bug-report" style="color:#2563eb">Report a bug</a> if something's wrong
            </p>
          </div>
          <div style="padding:12px 20px;background:#f3f4f6;text-align:center">
            <a href="${this.baseUrl}/unsubscribe?token=${unsubToken}" style="color:#9ca3af;font-size:11px;text-decoration:none">Unsubscribe from emails</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
