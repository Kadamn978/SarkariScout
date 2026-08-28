import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.job.findMany({ select: { id: true, title: true, org: true } });
  console.log('=== JOBS IN DB:', jobs.length, '===');
  jobs.forEach(j => console.log(' -', j.title.substring(0,70), '|', j.org));

  const logs = await prisma.crawlLog.findMany({ orderBy: { startedAt: 'desc' }, take: 20 });
  console.log('\n=== CRAWL LOGS (last 20) ===');
  for (const l of logs) {
    const src = await prisma.source.findUnique({ where: { id: l.sourceId }, select: { name: true } });
    console.log(' -', src?.name, '|', l.status, '| found:', l.itemsFound, 'new:', l.itemsNew, 'upd:', l.itemsUpdated, '|', (l.errorMessage || '').substring(0,100), '|', l.duration, 'ms');
  }

  const sources = await prisma.source.findMany({ select: { id: true, name: true, type: true, baseUrl: true, lastRunStatus: true, lastRunAt: true, itemsPerRun: true } });
  console.log('\n=== SOURCES ===');
  sources.forEach(s => console.log(' -', s.name, '|', s.type, '| last:', s.lastRunStatus || 'never', '| items:', s.itemsPerRun || 0, '|', (s.baseUrl || '').substring(0,60)));
}
main().then(() => prisma.$disconnect());
