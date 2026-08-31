import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { ResolvedJob } from './source-resolver.agent'

@Injectable()
export class SourceManagerAgent {
  private readonly logger = new Logger(SourceManagerAgent.name)

  constructor(private prisma: PrismaService) {}

  async addMissingSources(resolvedJobs: ResolvedJob[]): Promise<{
    added: string[]
    alreadyExists: string[]
    unresolved: string[]
  }> {
    const added: string[] = []
    const alreadyExists: string[] = []
    const unresolved: string[] = []

    // Group by official domain
    const domainGroups = new Map<string, ResolvedJob[]>()
    for (const job of resolvedJobs) {
      if (!job.officialDomain) {
        unresolved.push(job.title)
        continue
      }

      const existing = await this.prisma.source.findFirst({
        where: { baseUrl: { contains: job.officialDomain } },
      })

      if (existing) {
        alreadyExists.push(job.officialDomain)
        continue
      }

      const group = domainGroups.get(job.officialDomain) || []
      group.push(job)
      domainGroups.set(job.officialDomain, group)
    }

    // Add missing sources
    for (const [domain, jobs] of domainGroups) {
      const job = jobs[0] // Use first job to determine source details
      const sourceId = this.generateSourceId(domain)

      try {
        await this.prisma.source.create({
          data: {
            id: sourceId,
            name: `${job.org || domain} (Discovered)`,
            type: 'HTML',
            baseUrl: job.officialUrl || `https://${domain}`,
            schedule: '0 */6 * * *',
            enabled: true,
            configJson: JSON.stringify({
              discoveredFrom: job.siteName,
              discoveredAt: new Date().toISOString(),
              isDiscovered: true,
            }),
            rateLimitMs: 3000,
            retryCount: 3,
          },
        })

        added.push(domain)
        this.logger.log(`Added new source: ${domain} (${sourceId})`)
      } catch (e) {
        this.logger.error(`Failed to add source ${domain}: ${(e as Error).message}`)
      }
    }

    this.logger.log(
      `Source management: ${added.length} added, ${alreadyExists.length} exist, ${unresolved.length} unresolved`,
    )

    return { added, alreadyExists, unresolved }
  }

  private generateSourceId(domain: string): string {
    return domain
      .replace(/\.(gov\.in|nic\.in|com|org|in)$/i, '')
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)
  }

  async getDiscoveredSources() {
    return this.prisma.source.findMany({
      where: { configJson: { contains: '"isDiscovered":true' } },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        enabled: true,
        lastRunAt: true,
        lastRunStatus: true,
      },
    })
  }
}
