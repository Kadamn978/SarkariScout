import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.job.deleteMany({});
  console.log('Deleted', count.count, 'seeded jobs');
  const userCount = await prisma.user.count();
  const sourceCount = await prisma.source.count();
  const crawlLogCount = await prisma.crawlLog.count();
  console.log('Users remaining:', userCount);
  console.log('Sources remaining:', sourceCount);
  console.log('Crawl logs:', crawlLogCount);
}
main().then(() => prisma.$disconnect());
