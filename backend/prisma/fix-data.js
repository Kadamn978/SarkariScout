const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    // 1. Clean HTML entities from titles
    const all = await p.job.findMany({ select: { id: true, title: true } });
    let cleaned = 0;
    for (const j of all) {
      if (j.title.includes('&')) {
        const t = j.title
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#0?39;/g, "'")
          .replace(/&#\d+;/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (t !== j.title) {
          await p.job.update({ where: { id: j.id }, data: { title: t } });
          cleaned++;
        }
      }
    }
    console.log('Cleaned HTML entities from', cleaned, 'jobs');

    // 2. Auto-close expired jobs
    const r = await p.job.updateMany({
      where: { status: 'OPEN', applyEnd: { not: null, lt: new Date() } },
      data: { status: 'CLOSED' },
    });
    console.log('Auto-closed', r.count, 'expired jobs');

    // 3. Delete very old closed jobs (90+ days past applyEnd)
    const cutoff = new Date(Date.now() - 90 * 86400000);
    const old = await p.job.deleteMany({
      where: { status: 'CLOSED', applyEnd: { not: null, lt: cutoff } },
    });
    console.log('Deleted', old.count, 'old jobs (90+ days)');

    // 4. Stats
    const total = await p.job.count();
    const open = await p.job.count({ where: { status: 'OPEN' } });
    console.log('Total:', total, 'OPEN:', open);
  } catch (e) {
    console.error(e.message);
  } finally {
    await p.$disconnect();
  }
})();
