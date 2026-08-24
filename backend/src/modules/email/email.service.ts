import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private prisma: PrismaService) {}

  async sendDailyDigest() {
    const profiles = await this.prisma.profile.findMany({
      where: { notifyDigest: true },
      include: { user: true },
    });

    let sent = 0;
    for (const profile of profiles) {
      try {
        const matchingJobs = await this.getMatchingJobs(profile);
        if (matchingJobs.length === 0) continue;

        const userEmail = (profile as any).user?.email;
        if (!userEmail) continue;

        await this.sendEmail({
          to: userEmail,
          subject: `SarkariScout: ${matchingJobs.length} new jobs match your profile`,
          html: this.buildDigestHtml(matchingJobs, profile),
        });
        sent++;
      } catch (e) {
        this.logger.error(`Digest failed: ${(e as Error).message}`);
      }
    }
    return { sent, total: profiles.length };
  }

  async sendInstantAlert(userId: string, jobId: string, changeType?: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile?.notifyInstant) return false;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return false;

    const subject = changeType
      ? `SarkariScout Alert: ${job.title} - ${changeType}`
      : `SarkariScout: New job matching your profile - ${job.title}`;

    await this.sendEmail({
      to: user.email,
      subject,
      html: this.buildAlertHtml(job, changeType),
    });

    await this.prisma.notificationLog.create({
      data: { userId, jobId, type: changeType ? 'INSTANT' : 'DIGEST' },
    });

    return true;
  }

  async sendWelcomeEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to SarkariScout!',
      html: `<h1>Welcome ${user.name || 'there'}!</h1><p>Start browsing jobs at <a href="${process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/jobs">SarkariScout Jobs</a></p>`,
    });
  }

  private async getMatchingJobs(profile: any) {
    const jobs = await this.prisma.job.findMany({
      where: { status: 'OPEN', applyEnd: { gte: new Date() } },
      orderBy: { applyEnd: 'asc' },
      take: 20,
    });
    return jobs.filter((job) => {
      if (job.state !== 'ALL_IN' && profile.state && job.state !== profile.state) return false;
      return true;
    });
  }

  async sendEmail(opts: { to: string; subject: string; html: string }) {
    this.logger.log(`Email to ${opts.to}: ${opts.subject}`);

    if (process.env.SMTP_HOST) {
      // Production: use SMTP/Brevo
      // TODO: integrate with Brevo API or nodemailer
      this.logger.log('SMTP configured, would send email');
    } else {
      this.logger.log('No SMTP configured, email logged only');
    }
  }

  private buildDigestHtml(jobs: any[], profile: any): string {
    const jobList = jobs.map((j) => `
      <tr><td style="padding:8px;border-bottom:1px solid #eee">
        <strong>${j.title}</strong><br/>
        <small>${j.org} | ${j.state} | Deadline: ${j.applyEnd?.toLocaleDateString() || 'N/A'}</small>
      </td></tr>
    `).join('');

    return `
      <h2>Your Daily Job Digest</h2>
      <p>Hi ${(profile as any).user?.name || 'there'}, here are ${jobs.length} jobs matching your profile:</p>
      <table style="width:100%;border-collapse:collapse">${jobList}</table>
      <p><a href="${process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/jobs">View all on SarkariScout</a></p>
    `;
  }

  private buildAlertHtml(job: any, changeType?: string): string {
    return `
      <h2>${changeType ? 'Job Update' : 'New Job Alert'}</h2>
      <h3>${job.title}</h3>
      <p><strong>Organization:</strong> ${job.org}</p>
      <p><strong>State:</strong> ${job.state}</p>
      <p><strong>Deadline:</strong> ${job.applyEnd?.toLocaleDateString() || 'N/A'}</p>
      ${changeType ? `<p><strong>Change:</strong> ${changeType}</p>` : ''}
      ${job.applyUrl ? `<p><a href="${job.applyUrl}">Apply Now</a></p>` : ''}
    `;
  }
}
