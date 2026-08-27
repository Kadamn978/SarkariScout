import { Injectable, Logger } from '@nestjs/common';

export interface URLVerificationResult {
  url: string;
  isOfficial: boolean;
  officialDomain: string | null;
  reason: string;
  confidence: number; // 0-100
}

@Injectable()
export class FakeSiteDetectorService {
  private readonly logger = new Logger(FakeSiteDetectorService.name);

  // Official government domains — verified list
  private readonly officialDomains: Record<string, string[]> = {
    'ssc.gov.in': ['ssc.gov.in'],
    'upsc.gov.in': ['upsc.gov.in', 'upsconline.nic.in'],
    'ibps.in': ['ibps.in'],
    'rrbapply.gov.in': ['rrbapply.gov.in', 'rrb.gov.in'],
    'indiapostgdsonline.gov.in': ['indiapostgdsonline.gov.in', 'indiapost.gov.in'],
    'joinindianarmy.nic.in': ['joinindianarmy.nic.in'],
    'joinindiannavy.gov.in': ['joinindiannavy.gov.in'],
    'afcat.cdac.in': ['afcat.cdac.in'],
    'drdo.gov.in': ['drdo.gov.in'],
    'isro.gov.in': ['isro.gov.in'],
    'sbi.co.in': ['sbi.co.in'],
    'rbi.org.in': ['rbi.org.in'],
    'uppsc.up.nic.in': ['uppsc.up.nic.in'],
    'upsssc.gov.in': ['upsssc.gov.in'],
    'bpsc.gov.in': ['bpsc.gov.in'],
    'mpsc.gov.in': ['mpsc.gov.in'],
    'rpsc.rajasthan.gov.in': ['rpsc.rajasthan.gov.in'],
    'mppsc.mp.gov.in': ['mppsc.mp.gov.in'],
    'dsssb.delhi.gov.in': ['dsssb.delhi.gov.in'],
    'hssc.gov.in': ['hssc.gov.in'],
    'keralapsc.gov.in': ['keralapsc.gov.in'],
    'tnpsc.gov.in': ['tnpsc.gov.in'],
    'kpsc.kar.nic.in': ['kpsc.kar.nic.in'],
    'gpsc.gujarat.gov.in': ['gpsc.gujarat.gov.in'],
    'cbse.gov.in': ['cbse.gov.in'],
    'kvsangathan.nic.in': ['kvsangathan.nic.in'],
    'navodaya.gov.in': ['navodaya.gov.in'],
    'icmr.gov.in': ['icmr.gov.in'],
    'nic.in': ['nic.in'],
    'fci.gov.in': ['fci.gov.in'],
    'nhai.gov.in': ['nhai.gov.in'],
    'rssb.rajasthan.gov.in': ['rssb.rajasthan.gov.in'],
    'employmentnews.gov.in': ['employmentnews.gov.in'],
    'ncs.gov.in': ['ncs.gov.in'],
  };

  // Known fake/phishing domains (pattern matching)
  private readonly fakePatterns: string[] = [
    /sscresult/gi,
    /upscresult/gi,
    /ibpsresult/gi,
    /govtjob/gi,
    /sarkariresult/gi,
    /sarkari/gi,
    /naukri/gi,
    /freejobalert/gi,
    /adda247/gi,
    /testbook/gi,
    /gradeup/gi,
    /jagranjosh/gi,
    /careerpower/gi,
    /sscxpress/gi,
  ];

  // Suspicious TLDs
  private readonly suspiciousTlds: string[] = [
    '.xyz', '.top', '.club', '.online', '.site', '.info',
    '.buzz', '.gq', '.ml', '.cf', '.tk', '.ga',
  ];

  verifyURL(url: string, expectedSource?: string): URLVerificationResult {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      // Check 1: Is it a known official domain?
      if (expectedSource) {
        const officialDomains = this.officialDomains[expectedSource] || [];
        if (officialDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
          return {
            url,
            isOfficial: true,
            officialDomain: expectedSource,
            reason: 'Matches known official domain',
            confidence: 100,
          };
        }
      }

      // Check 2: Is it a .gov.in or .nic.in domain?
      if (hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in')) {
        return {
          url,
          isOfficial: true,
          officialDomain: hostname,
          reason: 'Government domain (.gov.in / .nic.in)',
          confidence: 95,
        };
      }

      // Check 3: Is it a known fake pattern?
      for (const pattern of this.fakePatterns) {
        pattern.lastIndex = 0; // Reset regex state
        if (pattern.test(hostname)) {
          return {
            url,
            isOfficial: false,
            officialDomain: null,
            reason: `Matches known fake/aggregator pattern: ${pattern.source}`,
            confidence: 90,
          };
        }
      }

      // Check 4: Suspicious TLD?
      const tld = '.' + hostname.split('.').pop();
      if (this.suspiciousTlds.includes(tld)) {
        return {
          url,
          isOfficial: false,
          officialDomain: null,
          reason: `Suspicious TLD: ${tld}`,
          confidence: 80,
        };
      }

      // Check 5: Domain similarity attack (typosquatting)
      const allOfficialDomains = Object.values(this.officialDomains).flat();
      for (const official of allOfficialDomains) {
        if (this.isLevenshteinSimilar(hostname, official) && hostname !== official) {
          return {
            url,
            isOfficial: false,
            officialDomain: official,
            reason: `Possible typosquatting of ${official}`,
            confidence: 75,
          };
        }
      }

      // Check 6: Is it a .com version of a known .gov.in domain?
      for (const official of allOfficialDomains) {
        const comVersion = official.replace('.gov.in', '').replace('.nic.in', '') + '.com';
        if (hostname === comVersion || hostname.endsWith('.' + comVersion)) {
          return {
            url,
            isOfficial: false,
            officialDomain: official,
            reason: `Commercial version of government domain ${official}`,
            confidence: 85,
          };
        }
      }

      // Unknown — conservative approach
      return {
        url,
        isOfficial: false,
        officialDomain: null,
        reason: 'Unknown domain — not in official whitelist',
        confidence: 50,
      };
    } catch (e) {
      return {
        url,
        isOfficial: false,
        officialDomain: null,
        reason: `Invalid URL: ${(e as Error).message}`,
        confidence: 0,
      };
    }
  }

  async verifySourceUrl(sourceUrl: string, sourceBaseUrl: string): Promise<URLVerificationResult> {
    // First try with the source base URL context
    const result = this.verifyURL(sourceUrl, sourceBaseUrl);

    if (result.isOfficial) return result;

    // If not official, try fetching the page to verify
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(sourceUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      // Check if redirected to an official domain
      if (res.url) {
        const redirectResult = this.verifyURL(res.url, sourceBaseUrl);
        if (redirectResult.isOfficial) {
          return {
            ...redirectResult,
            reason: `Redirects to official domain: ${redirectResult.officialDomain}`,
            confidence: redirectResult.confidence,
          };
        }
      }
    } catch (e) {
      // Can't verify via fetch — keep original result
    }

    return result;
  }

  getOfficialDomains(): Record<string, string[]> {
    return { ...this.officialDomains };
  }

  private isLevenshteinSimilar(a: string, b: string): boolean {
    // Simple check: if domains differ by 1-2 characters, it's suspicious
    if (Math.abs(a.length - b.length) > 2) return false;

    let differences = 0;
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      if (a[i] !== b[i]) differences++;
      if (differences > 2) return false;
    }
    return differences > 0 && differences <= 2;
  }
}
