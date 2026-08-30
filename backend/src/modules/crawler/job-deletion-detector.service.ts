import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { EmailService } from '../email/email.service'
import { validateUrl, sanitizeError } from './url-validator'
import { sleep } from './shared-utils'

export interface DeletionCheckResult {
  sourceId: string
  sourceName: string
  totalChecked: number
  stillAlive: number
  deleted: number
  deletedJobs: { id: string; title: string; org: string; sourceUrl: string }[]
  errors: string[]
}

@Injectable()
export class JobDeletionDetectorService {
  private readonly logger = new Logger(JobDeletionDetectorService.name)
  private readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async checkSourceForDeletions(sourceId: string): Promise<DeletionCheckResult> {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } })
    if (!source) {
      return {
        sourceId,
        sourceName: 'Unknown',
        totalChecked: 0,
        stillAlive: 0,
        deleted: 0,
        deletedJobs: [],
        errors: ['Source not found'],
      }
    }

    const jobs = await this.prisma.job.findMany({
      where: { sourceId, status: 'OPEN' },
      select: { id: true, title: true, org: true, sourceUrl: true },
    })

    this.logger.log(`Checking ${jobs.length} jobs from ${source.name} for deletions`)
    const errors: string[] = []
    const deletedJobs: { id: string; title: string; org: string; sourceUrl: string }[] = []
    const aliveIds: string[] = []

    // Check URLs in parallel (5 at a time)
    const checkResults = await Promise.allSettled(
      jobs.map(async (job) => {
        const isAlive = await this.checkUrlAlive(job.sourceUrl)
        return { ...job, isAlive }
      }),
    )

    for (const result of checkResults) {
      if (result.status === 'fulfilled') {
        const { id, title, org, sourceUrl, isAlive } = result.value
        if (isAlive) {
          aliveIds.push(id)
        } else {
          deletedJobs.push({ id, title, org, sourceUrl })
          this.logger.warn(`Job appears deleted: ${title} (${sourceUrl})`)
        }
      } else {
        // Network error — assume alive
        const msg = sanitizeError(result.reason)
        if (!errors.includes(msg)) errors.push(msg)
      }
    }

    // Batch update alive jobs
    if (aliveIds.length > 0) {
      await this.prisma.job.updateMany({
        where: { id: { in: aliveIds } },
        data: { lastSeenAt: new Date() },
      })
    }

    return {
      sourceId,
      sourceName: source.name,
      totalChecked: jobs.length,
      stillAlive: aliveIds.length,
      deleted: deletedJobs.length,
      deletedJobs,
      errors,
    }
  }

  async markDeletedJobs(deletedJobs: { id: string; title: string }[]): Promise<number> {
    if (deletedJobs.length === 0) return 0

    const ids = deletedJobs.map((j) => j.id)
    const result = await this.prisma.job.updateMany({
      where: { id: { in: ids } },
      data: {
        status: 'CLOSED',
        applyUrl: null,
        eligibilityCriteria:
          'This job listing has been removed from the official source. Please verify on the official website before applying.',
      },
    })

    return result.count
  }

  async notifyDeletedJobs(
    deletedJobs: { id: string; title: string; org: string }[],
  ): Promise<void> {
    if (deletedJobs.length === 0) return

    // Batch fetch all tracked users for all deleted jobs
    const jobIds = deletedJobs.map((j) => j.id)
    const trackedUsers = await this.prisma.userJob.findMany({
      where: { jobId: { in: jobIds } },
      include: { user: { select: { id: true, email: true, name: true } } },
    })

    // Send notifications
    for (const tracking of trackedUsers) {
      const job = deletedJobs.find((j) => j.id === tracking.jobId)
      if (!job) continue

      try {
        await this.email.sendJobDeletionNotice(
          tracking.user.email,
          tracking.user.name || 'Candidate',
          job.title,
          job.org,
        )
      } catch (e) {
        this.logger.error(
          `Failed to notify user ${tracking.user.email} about deleted job: ${(e as Error).message}`,
        )
      }
    }
  }

  async runFullDeletionCheck(): Promise<DeletionCheckResult[]> {
    const sources = await this.prisma.source.findMany({
      where: { enabled: true },
      select: { id: true, name: true },
    })

    this.logger.log(`Running deletion check across ${sources.length} sources`)
    const results: DeletionCheckResult[] = []

    for (const source of sources) {
      const result = await this.checkSourceForDeletions(source.id)
      results.push(result)

      if (result.deleted > 0) {
        this.logger.warn(`${result.sourceName}: ${result.deleted} jobs appear deleted`)
        await this.markDeletedJobs(result.deletedJobs)
        await this.notifyDeletedJobs(result.deletedJobs)
      }

      await sleep(5000)
    }

    return results
  }

  private async checkUrlAlive(url: string): Promise<boolean> {
    if (!url || url === 'about:blank') return false

    // Validate URL before fetching
    const urlCheck = validateUrl(url)
    if (!urlCheck.valid) {
      this.logger.warn(`Blocked invalid URL for deletion check: ${urlCheck.reason}`)
      return true // Assume alive if URL is invalid
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': this.USER_AGENT },
      signal: controller.signal,
      redirect: 'manual',
    })
    clearTimeout(timeout)

    return res.status < 400
  }
}
