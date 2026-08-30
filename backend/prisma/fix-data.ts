import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Clean &nbsp; from job titles
  const allJobs = await prisma.job.findMany({ select: { id: true, title: true } });
  let cleaned = 0;
  for (const job of allJobs) {
    if (job.title.includes('&nbsp;') || job.title.includes('&#') || job.title.includes('&amp;')) {
      const newTitle = job.title
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      await prisma.job.update({ where: { id: job.id }, data: { title: newTitle } });
      cleaned++;
    }
  }
  console.log(`Cleaned HTML entities from ${cleaned} jobs`);

  // 2. Auto-expire old jobs: if applyEnd is in the past, mark as CLOSED
  const expiredResult = await prisma.job.updateMany({
    where: {
      status: 'OPEN',
      applyEnd: { not: null, lt: new Date() },
    },
    data: { status: 'CLOSED' },
  });
  console.log(`Auto-closed ${expiredResult.count} expired jobs (applyEnd < now)`);

  // 3. Delete very old jobs: closed for 90+ days after applyEnd
  const cutoff = new Date(Date.now() - 90 * 86400000);
  const oldJobs = await prisma.job.deleteMany({
    where: {
      status: 'CLOSED',
      applyEnd: { not: null, lt: cutoff },
    },
  });
  console.log(`Deleted ${oldJobs.count} old jobs (closed 90+ days)`);

  // 4. Stats
  const total = await prisma.job.count();
  const open = await prisma.job.count({ where: { status: 'OPEN' } });
  const openWithEnd = await prisma.job.count({ where: { status: 'OPEN', applyEnd: { not: null, gte: new Date() } } });
  const openNoEnd = await prisma.job.count({ where: { status: 'OPEN', applyEnd: null } });
  console.log(`\nFinal: ${total} total, ${open} OPEN (${openWithEnd} with deadline, ${openNoEnd} no deadline)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
