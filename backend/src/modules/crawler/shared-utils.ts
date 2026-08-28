import { Logger } from '@nestjs/common';

const logger = new Logger('SharedUtils');

// ─── Time ───
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

export function getIST(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + IST_OFFSET);
}

export function getISTHour(): number {
  return getIST().getHours();
}

// ─── Sleep ───
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── HTML ───
export function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Organization extraction ───
const ORG_MAP: Record<string, string> = {
  'SSC': 'Staff Selection Commission',
  'UPSC': 'Union Public Service Commission',
  'IBPS': 'Institute of Banking Personnel Selection',
  'RRB': 'Railway Recruitment Boards',
  'SBI': 'State Bank of India',
  'MPSC': 'Maharashtra Public Service Commission',
  'BPSC': 'Bihar Public Service Commission',
  'DRDO': 'Defence Research and Development Organisation',
  'ISRO': 'Indian Space Research Organisation',
  'ONGC': 'Oil and Natural Gas Corporation',
  'NTPC': 'National Thermal Power Corporation',
  'BSF': 'Border Security Force',
  'CRPF': 'Central Reserve Police Force',
  'CISF': 'Central Industrial Security Force',
  'ITBP': 'Indo-Tibetan Border Police',
  'CBI': 'Central Bureau of Investigation',
  'NTRO': 'National Technical Research Organisation',
  'BARC': 'Bhabha Atomic Research Centre',
  'IOCL': 'Indian Oil Corporation',
  'BEL': 'Bharat Electronics Limited',
  'HAL': 'Hindustan Aeronautics Limited',
  'NIA': 'National Investigation Agency',
  'NIOS': 'National Institute of Open Schooling',
  'ESIC': 'Employees State Insurance Corporation',
  'AIIMS': 'All India Institute of Medical Sciences',
  'KVS': 'Kendriya Vidyalaya Sangathan',
  'DSSSB': 'Delhi Subordinate Services Selection Board',
  'TNPSC': 'Tamil Nadu Public Service Commission',
  'KPSC': 'Karnataka Public Service Commission',
  'WBPSC': 'West Bengal Public Service Commission',
};

export function extractOrgFromTitle(title: string): string {
  for (const [abbr, full] of Object.entries(ORG_MAP)) {
    if (title.toUpperCase().includes(abbr)) return full;
  }
  return 'Government of India';
}

// ─── Email ───
export function sanitizeEmailSubject(subject: string): string {
  return subject.replace(/[\r\n]/g, '').substring(0, 200);
}

export function maskEmail(email: string): string {
  return email.replace(/(.{2}).*(@.*)/, '$1***$2');
}

// ─── Error handling ───
export function sanitizeError(error: unknown): string {
  const msg = (error as Error).message || 'Unknown error';
  return msg
    .replace(/[A-Z]:\\[^\s]+/g, '[path]')
    .replace(/\/[^\s]+/g, '[path]')
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[ip]')
    .substring(0, 200);
}

// ─── Concurrency limiter ───
export async function parallelLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<any>,
): Promise<{ results: any[]; errors: { item: T; error: Error }[] }> {
  const results: any[] = [];
  const errors: { item: T; error: Error }[] = [];
  const executing: Promise<any>[] = [];

  for (const item of items) {
    const p = fn(item)
      .then((r) => results.push(r))
      .catch((e) => errors.push({ item, error: e }));

    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((e) => e === Promise.race(executing)),
        1,
      );
    }
  }

  await Promise.allSettled(executing);
  return { results, errors };
}
