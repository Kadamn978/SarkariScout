// Plain JS seed script — runs in Docker without ts-node
// Creates admin user, test user, and 15 job sources
// NO sample jobs — crawler fetches real jobs on startup

const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding admin user, test user, and job sources...');

  // Admin user
  const adminEmail = 'kadamn978+rozgarscout@gmail.com';
  const adminPassword = 'Aurangabad@1';
  const passwordHash = await argon2.hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Nilesh Admin',
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  });
  console.log('[Seed] Admin user:', admin.email);

  // Test user
  const testEmail = 'kadamn978+test@gmail.com';
  const testPassword = 'Test@12345';
  const testHash = await argon2.hash(testPassword);

  const testUser = await prisma.user.upsert({
    where: { email: testEmail },
    update: {},
    create: {
      email: testEmail,
      passwordHash: testHash,
      name: 'Test User',
      role: 'USER',
      emailVerifiedAt: new Date(),
    },
  });
  console.log('[Seed] Test user:', testUser.email);

  // Test user profile
  await prisma.profile.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      educationLevel: 'Graduate',
      state: 'Maharashtra',
      category: 'OBC',
      gender: 'Male',
      dob: new Date('1998-05-15'),
    },
  });
  console.log('[Seed] Test user profile created');

  // 15 job sources
  const sources = [
    { name: 'SSC', type: 'HTML', baseUrl: 'https://ssc.gov.in', schedule: '0 */6 * * *' },
    { name: 'UPSC', type: 'HTML', baseUrl: 'https://upsc.gov.in', schedule: '0 */6 * * *' },
    { name: 'IBPS', type: 'HTML', baseUrl: 'https://ibps.in', schedule: '0 */6 * * *' },
    { name: 'RRB', type: 'HTML', baseUrl: 'https://rrbapply.gov.in', schedule: '0 */6 * * *' },
    { name: 'NCS API', type: 'NCS_API', baseUrl: 'https://api.ncs.gov.in', schedule: '0 */2 * * *' },
    { name: 'MPSC', type: 'HTML', baseUrl: 'https://mpsc.gov.in', schedule: '0 */6 * * *' },
    { name: 'CRIS', type: 'HTML', baseUrl: 'https://cris.org.in', schedule: '0 */6 * * *' },
    { name: 'DRDO', type: 'HTML', baseUrl: 'https://drdo.gov.in', schedule: '0 */12 * * *' },
    { name: 'ISRO', type: 'HTML', baseUrl: 'https://isro.gov.in', schedule: '0 */12 * * *' },
    { name: 'Employment News', type: 'RSS', baseUrl: 'https://employmentnews.gov.in', schedule: '0 */4 * * *' },
    { name: 'SBI', type: 'HTML', baseUrl: 'https://sbi.co.in', schedule: '0 */6 * * *' },
    { name: 'NTRO', type: 'HTML', baseUrl: 'https://ntro.gov.in', schedule: '0 */12 * * *' },
    { name: 'BARC', type: 'HTML', baseUrl: 'https://barc.gov.in', schedule: '0 */12 * * *' },
    { name: 'IOCL', type: 'HTML', baseUrl: 'https://iocl.com', schedule: '0 */12 * * *' },
    { name: 'ONGC', type: 'HTML', baseUrl: 'https://ongcindia.com', schedule: '0 */12 * * *' },
  ];

  for (const s of sources) {
    const id = s.name.toLowerCase().replace(/\s+/g, '-');
    await prisma.source.upsert({
      where: { id },
      update: {},
      create: { id, ...s },
    });
  }
  console.log('[Seed] Sources seeded:', sources.length);
  console.log('[Seed] Done. No sample jobs — crawler will fetch real jobs on startup.');
}

main()
  .catch((e) => { console.error('[Seed] Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
