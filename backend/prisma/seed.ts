import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user, test user, and job sources...');

  // Create admin user
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
  console.log('Admin user:', admin.email);

  // Create a test regular user
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
  console.log('Test user:', testUser.email);

  // Create profile for test user
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
  console.log('Test user profile created');

  // Job sources — 15 sources covering all major Indian govt job portals
  const sources = [
    { name: 'SSC', type: 'HTML' as const, baseUrl: 'https://ssc.gov.in', schedule: '0 */6 * * *' },
    { name: 'UPSC', type: 'HTML' as const, baseUrl: 'https://upsc.gov.in', schedule: '0 */6 * * *' },
    { name: 'IBPS', type: 'HTML' as const, baseUrl: 'https://ibps.in', schedule: '0 */6 * * *' },
    { name: 'RRB', type: 'HTML' as const, baseUrl: 'https://rrbapply.gov.in', schedule: '0 */6 * * *' },
    { name: 'NCS API', type: 'NCS_API' as const, baseUrl: 'https://api.ncs.gov.in', schedule: '0 */2 * * *' },
    { name: 'MPSC', type: 'HTML' as const, baseUrl: 'https://mpsc.gov.in', schedule: '0 */6 * * *' },
    { name: 'CRIS', type: 'HTML' as const, baseUrl: 'https://cris.org.in', schedule: '0 */6 * * *' },
    { name: 'DRDO', type: 'HTML' as const, baseUrl: 'https://drdo.gov.in', schedule: '0 */12 * * *' },
    { name: 'ISRO', type: 'HTML' as const, baseUrl: 'https://isro.gov.in', schedule: '0 */12 * * *' },
    { name: 'Employment News', type: 'RSS' as const, baseUrl: 'https://employmentnews.gov.in', schedule: '0 */4 * * *' },
    { name: 'SBI', type: 'HTML' as const, baseUrl: 'https://sbi.co.in', schedule: '0 */6 * * *' },
    { name: 'NTRO', type: 'HTML' as const, baseUrl: 'https://ntro.gov.in', schedule: '0 */12 * * *' },
    { name: 'BARC', type: 'HTML' as const, baseUrl: 'https://barc.gov.in', schedule: '0 */12 * * *' },
    { name: 'IOCL', type: 'HTML' as const, baseUrl: 'https://iocl.com', schedule: '0 */12 * * *' },
    { name: 'ONGC', type: 'HTML' as const, baseUrl: 'https://ongcindia.com', schedule: '0 */12 * * *' },
  ];

  for (const s of sources) {
    await prisma.source.upsert({
      where: { id: s.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: s.name.toLowerCase().replace(/\s+/g, '-'), ...s },
    });
  }
  console.log('Sources seeded:', sources.length);
  console.log('Seed complete. No sample jobs — crawler will fetch real jobs on startup.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
