import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe!123';
  const userPassword = process.env.SEED_USER_PASSWORD || 'ChangeMe!456';

  const adminHash = await argon2.hash(adminPassword, { memoryCost: 65536, timeCost: 3 });
  const userHash = await argon2.hash(userPassword, { memoryCost: 65536, timeCost: 3 });

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sarkariscout.in' },
    update: {},
    create: {
      email: 'admin@sarkariscout.in',
      passwordHash: adminHash,
      name: 'System Administrator',
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          educationLevel: 'PG',
          state: 'Maharashtra',
          category: 'GEN',
        },
      },
    },
  });
  console.log('Admin seeded:', admin.email);

  // Demo user 1
  const demo1 = await prisma.user.upsert({
    where: { email: 'demo1@example.com' },
    update: {},
    create: {
      email: 'demo1@example.com',
      passwordHash: userHash,
      name: 'Demo User One',
      role: 'USER',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          educationLevel: 'Graduate',
          degrees: JSON.stringify(['B.E. Computer Science']),
          state: 'Maharashtra',
          district: 'Pune',
          languages: JSON.stringify(['Hindi', 'English']),
          category: 'GEN',
          dob: new Date('2000-01-01'),
          gender: 'Male',
          examFamilies: JSON.stringify(['SSC', 'IBPS', 'RRB']),
          keywords: JSON.stringify(['engineering', 'computer science']),
        },
      },
    },
  });
  console.log('Demo user 1 seeded:', demo1.email);

  // Demo user 2
  const demo2 = await prisma.user.upsert({
    where: { email: 'demo2@example.com' },
    update: {},
    create: {
      email: 'demo2@example.com',
      passwordHash: userHash,
      name: 'Demo User Two',
      role: 'USER',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          educationLevel: '12th Pass',
          state: 'Uttar Pradesh',
          district: 'Lucknow',
          languages: JSON.stringify(['Hindi', 'English']),
          category: 'OBC',
          dob: new Date('2000-06-15'),
          gender: 'Female',
          examFamilies: JSON.stringify(['SSC CHSL', 'SSC MTS']),
        },
      },
    },
  });
  console.log('Demo user 2 seeded:', demo2.email);

  // Job sources
  const sources = [
    { name: 'SSC', type: 'HTML' as const, baseUrl: 'https://ssc.gov.in', schedule: '0 */6 * * *' },
    { name: 'UPSC', type: 'HTML' as const, baseUrl: 'https://upsc.gov.in', schedule: '0 */6 * * *' },
    { name: 'IBPS', type: 'HTML' as const, baseUrl: 'https://ibps.in', schedule: '0 */6 * * *' },
    { name: 'RRB', type: 'HTML' as const, baseUrl: 'https://rrbapply.gov.in', schedule: '0 */6 * * *' },
    { name: 'NCS API', type: 'NCS_API' as const, baseUrl: 'https://api.ncs.gov.in', schedule: '0 */2 * * *' },
  ];

  for (const s of sources) {
    await prisma.source.upsert({
      where: { id: s.name.toLowerCase() },
      update: {},
      create: { id: s.name.toLowerCase(), ...s },
    });
  }
  console.log('Sources seeded:', sources.length);

  // Sample jobs
  const sampleJobs = [
    {
      fingerprint: 'ssc-cgl-2026-001',
      org: 'Staff Selection Commission',
      title: 'SSC CGL 2026 - Combined Graduate Level Examination',
      postNames: JSON.stringify(['Assistant Audit Officer', 'Assistant Section Officer', 'Inspector']),
      totalVacancies: 18000,
      state: 'ALL_IN',
      qualificationText: 'Graduate from recognized university',
      qualificationLevels: JSON.stringify(['Graduate', 'Post Graduate']),
      ageMin: 18,
      ageMax: 32,
      applyStart: new Date('2026-09-01'),
      applyEnd: new Date('2026-10-15'),
      examDate: new Date('2026-12-10'),
      status: 'OPEN' as const,
      applyUrl: 'https://ssc.gov.in/apply',
    },
    {
      fingerprint: 'ibps-po-xiv-001',
      org: 'Institute of Banking Personnel Selection',
      title: 'IBPS PO XIV - Probationary Officer Recruitment',
      postNames: JSON.stringify(['Probationary Officer / Management Trainee']),
      totalVacancies: 4000,
      state: 'ALL_IN',
      qualificationText: 'Graduate in any discipline',
      qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 20,
      ageMax: 30,
      applyStart: new Date('2026-08-01'),
      applyEnd: new Date('2026-08-31'),
      examDate: new Date('2026-10-15'),
      status: 'OPEN' as const,
      applyUrl: 'https://ibps.in/careers',
    },
    {
      fingerprint: 'rrb-ntpc-2026-001',
      org: 'Railway Recruitment Boards',
      title: 'RRB NTPC 2026 - Non-Technical Popular Categories',
      postNames: JSON.stringify(['Traffic Assistant', 'Goods Guard', 'Senior Time Keeper']),
      totalVacancies: 35000,
      state: 'ALL_IN',
      qualificationText: 'Graduate from recognized university',
      qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 18,
      ageMax: 33,
      applyStart: new Date('2026-09-15'),
      applyEnd: new Date('2026-10-30'),
      examDate: new Date('2027-01-15'),
      status: 'OPEN' as const,
      applyUrl: 'https://rrbapply.gov.in',
    },
    {
      fingerprint: 'mpsc-forest-2026-001',
      org: 'Maharashtra Public Service Commission',
      title: 'MPSC Forest Officer 2026',
      postNames: JSON.stringify(['Forest Officer', 'Range Forest Officer']),
      totalVacancies: 200,
      state: 'Maharashtra',
      qualificationText: 'Bachelor degree in Science/Engineering',
      qualificationLevels: JSON.stringify(['Graduate', 'Engineering']),
      ageMin: 18,
      ageMax: 38,
      applyStart: new Date('2026-09-01'),
      applyEnd: new Date('2026-09-30'),
      examDate: new Date('2026-12-20'),
      status: 'OPEN' as const,
      applyUrl: 'https://mpsc.gov.in',
    },
    {
      fingerprint: 'upsc-ese-2026-001',
      org: 'Union Public Service Commission',
      title: 'UPSC ESE 2026 - Engineering Services Examination',
      postNames: JSON.stringify(['Junior Engineer', 'Assistant Engineer']),
      totalVacancies: 600,
      state: 'ALL_IN',
      qualificationText: 'Engineering degree from recognized university',
      qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 21,
      ageMax: 30,
      applyStart: new Date('2026-08-15'),
      applyEnd: new Date('2026-09-15'),
      examDate: new Date('2027-01-10'),
      status: 'OPEN' as const,
      applyUrl: 'https://upsc.gov.in/examinations/apply-online',
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.upsert({
      where: { fingerprint: job.fingerprint },
      update: {},
      create: job,
    });
  }
  console.log('Jobs seeded:', sampleJobs.length);
  console.log('Seed complete. Use SEED_ADMIN_PASSWORD and SEED_USER_PASSWORD env vars to set passwords.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
