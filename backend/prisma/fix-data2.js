const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    // 1. Clean &nbsp; from postNames JSON field
    const all = await p.job.findMany({ select: { id: true, postNames: true } });
    let cleanedPosts = 0;
    for (const j of all) {
      if (j.postNames && j.postNames.includes('nbsp;')) {
        const cleaned = j.postNames
          .replace(/\\u0026nbsp;/g, ' ')
          .replace(/\\u0026amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleaned !== j.postNames) {
          await p.job.update({ where: { id: j.id }, data: { postNames: cleaned } });
          cleanedPosts++;
        }
      }
    }
    console.log('Cleaned postNames:', cleanedPosts);

    // 2. Delete old jobs with years 2017-2022 in title (from competitor scraper)
    const oldYears = ['2017', '2018', '2019', '2020', '2021', '2022'];
    let deletedOld = 0;
    for (const year of oldYears) {
      const r = await p.job.deleteMany({
        where: { title: { contains: year } },
      });
      deletedOld += r.count;
    }
    console.log('Deleted old year jobs:', deletedOld);

    // 3. Mark jobs with no applyEnd and old-looking titles as CLOSED
    const result = await p.job.updateMany({
      where: {
        status: 'OPEN',
        applyEnd: null,
        title: { contains: 'Online Form' },
      },
      data: { status: 'CLOSED' },
    });
    console.log('Closed old "Online Form" jobs:', result.count);

    // 4. Final stats
    const total = await p.job.count();
    const open = await p.job.count({ where: { status: 'OPEN' } });
    const closed = await p.job.count({ where: { status: 'CLOSED' } });
    console.log(`\nFinal: ${total} total, ${open} OPEN, ${closed} CLOSED`);
  } catch (e) {
    console.error(e.message);
  } finally {
    await p.$disconnect();
  }
})();
