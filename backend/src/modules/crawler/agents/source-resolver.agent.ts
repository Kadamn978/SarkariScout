import { Logger } from '@nestjs/common'
import { CompetitorJob } from './competitor-discovery.agent'

export interface ResolvedJob extends CompetitorJob {
  officialUrl: string
  officialDomain: string
  confidence: number
  isAlreadyTracked: boolean
}

export class SourceResolverAgent {
  private readonly logger = new Logger(SourceResolverAgent.name)

  // Maps org names to known official recruitment URLs
  private readonly OFFICIAL_SOURCE_MAP: Record<string, { domain: string; path: string }> = {
    SSC: { domain: 'ssc.gov.in', path: '/Portal/Notices' },
    UPSC: { domain: 'upsc.gov.in', path: '/exams-related-info/exam-notification/archives' },
    IBPS: { domain: 'ibps.in', path: '/index.php/recruitment/' },
    RRB: { domain: 'indianrailways.gov.in', path: '/rrb/' },
    SBI: {
      domain: 'sbi.co.in',
      path: '/web/interest-rates/current-interest-rates/sbv-/sbi-careers',
    },
    LIC: { domain: 'licindia.in', path: '/careers' },
    MPSC: { domain: 'mpsc.gov.in', path: '/adv_notification/' },
    RPSC: { domain: 'rpsc.rajasthan.gov.in', path: '/Home.aspx' },
    UPPSC: { domain: 'uppsc.up.nic.in', path: '/default.aspx' },
    UPSSSC: { domain: 'upsssc.gov.in', path: '/Default.aspx' },
    BSSC: { domain: 'bssc.bih.nic.in', path: '/bssc/advt.html' },
    DRDO: { domain: 'drdo.gov.in', path: '/careers' },
    ISRO: { domain: 'isro.gov.in', path: '/careers' },
    BARC: { domain: 'barc.gov.in', path: '/recruitment' },
    ONGC: { domain: 'ongcindia.com', path: '/web/ongcdata/home页/about-us/recruitment' },
    IOCL: { domain: 'iocl.com', path: '/pages/recruitments' },
    NHAI: { domain: 'nhai.gov.in', path: '/Page/Recruitment' },
    NTPC: { domain: 'ntpc.com', path: '/careers' },
    BHEL: { domain: 'bhel.in', path: '/careers' },
    SAIL: { domain: 'sail.co.in', path: '/careers' },
    IRCON: { domain: 'ircon.org', path: '/careers' },
    RITES: { domain: 'rites.com', path: '/careers' },
    NABARD: { domain: 'nabard.org', path: '/careers' },
    GIC: { domain: 'gicre.in', path: '/en/people-resources/career-en' },
    NIACL: { domain: 'newindia.co.in', path: '/recruitment/list' },
    OICL: { domain: 'orientalinsurance.org.in', path: '/careers' },
    UIIC: { domain: 'uiic.co.in', path: '/careers/recruitment' },
    NICL: { domain: 'nationalinsurance.nic.co.in', path: '/recruitment' },
    ECGC: { domain: 'ecgc.in', path: '/career-with-ecgc/' },
    IRDAI: { domain: 'irdai.gov.in', path: '/careers' },
    'Indian Army': { domain: 'joinindianarmy.nic.in', path: '/' },
    'Indian Navy': { domain: 'indiannavy.nic.in', path: '/careers' },
    'Indian Air Force': { domain: 'careerairforce.nic.in', path: '/' },
    CRPF: { domain: 'crpf.gov.in', path: '/recruitment' },
    BSF: { domain: 'bsf.gov.in', path: '/recruitment' },
    CISF: { domain: 'cisf.gov.in', path: '/recruitment' },
    ITBP: { domain: 'itbpolice.nic.in', path: '/recruitment' },
  }

  // Domain mapping for known official sources
  private readonly DOMAIN_MAP: Record<string, string> = {
    'ssc.nic.in': 'ssc.gov.in',
    'ssc.gov.in': 'ssc.gov.in',
    'upsc.gov.in': 'upsc.gov.in',
    'ibps.in': 'ibps.in',
    'ibpsonline.ibps.in': 'ibps.in',
    'rpsc.rajasthan.gov.in': 'rpsc.rajasthan.gov.in',
    'uppsc.up.nic.in': 'uppsc.up.nic.in',
    'licindia.in': 'licindia.in',
    'mpsc.gov.in': 'mpsc.gov.in',
  }

  async resolveAll(jobs: CompetitorJob[], trackedDomains: string[]): Promise<ResolvedJob[]> {
    const resolved: ResolvedJob[] = []

    for (const job of jobs) {
      const result = this.resolveJob(job, trackedDomains)
      resolved.push(result)
    }

    this.logger.log(
      `Resolved ${resolved.length} jobs, ${resolved.filter((r) => !r.isAlreadyTracked).length} need new sources`,
    )
    return resolved
  }

  private resolveJob(job: CompetitorJob, trackedDomains: string[]): ResolvedJob {
    // 1. Try to match org to known official source
    const officialSource = this.OFFICIAL_SOURCE_MAP[job.org]
    if (officialSource) {
      const domain = officialSource.domain
      const isTracked = trackedDomains.some((td) => td.includes(domain) || domain.includes(td))
      return {
        ...job,
        officialUrl: `https://${domain}${officialSource.path}`,
        officialDomain: domain,
        confidence: 0.9,
        isAlreadyTracked: isTracked,
      }
    }

    // 2. Try to extract official domain from competitor link
    const linkDomain = this.extractOfficialDomainFromLink(job.url)
    if (linkDomain) {
      const isTracked = trackedDomains.some(
        (td) => td.includes(linkDomain) || linkDomain.includes(td),
      )
      return {
        ...job,
        officialUrl: `https://${linkDomain}`,
        officialDomain: linkDomain,
        confidence: 0.7,
        isAlreadyTracked: isTracked,
      }
    }

    // 3. Fallback: try to infer from job title
    const inferredOrg = this.inferOrgFromTitle(job.title)
    if (inferredOrg) {
      const source = this.OFFICIAL_SOURCE_MAP[inferredOrg]
      if (source) {
        const isTracked = trackedDomains.some((td) => td.includes(source.domain))
        return {
          ...job,
          officialUrl: `https://${source.domain}${source.path}`,
          officialDomain: source.domain,
          confidence: 0.6,
          isAlreadyTracked: isTracked,
        }
      }
    }

    // 4. Unknown - mark as unresolved
    return {
      ...job,
      officialUrl: '',
      officialDomain: '',
      confidence: 0,
      isAlreadyTracked: false,
    }
  }

  private extractOfficialDomainFromLink(url: string): string | null {
    try {
      const hostname = new URL(url).hostname

      // Check if it's already an official domain
      for (const [alias, canonical] of Object.entries(this.DOMAIN_MAP)) {
        if (hostname.includes(alias)) return canonical
      }

      // Check for gov.in / nic.in domains
      if (hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in')) {
        return hostname
      }

      return null
    } catch {
      return null
    }
  }

  private inferOrgFromTitle(title: string): string | null {
    const patterns: [RegExp, string][] = [
      [/ssc\s+(cgl|chsl|je|gd|mts|steno|to|aso|compiler)/i, 'SSC'],
      [/ibps\s+(po|clerk|rrb|so|po)/i, 'IBPS'],
      [/rrb\s+\w+/i, 'RRB'],
      [/uppsc/i, 'UPPSC'],
      [/rpsc/i, 'RPSC'],
      [/mpsc/i, 'MPSC'],
      [/lic\s+(aao|ado|assistant)/i, 'LIC'],
      [/sbi\s+(po|clerk|so)/i, 'SBI'],
      [/drdo/i, 'DRDO'],
      [/isro/i, 'ISRO'],
      [/ntpc/i, 'NTPC'],
      [/bhel/i, 'BHEL'],
      [/sail/i, 'SAIL'],
    ]

    for (const [pattern, org] of patterns) {
      if (pattern.test(title)) return org
    }

    return null
  }
}
