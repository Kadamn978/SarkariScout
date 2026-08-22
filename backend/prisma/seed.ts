import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await argon2.hash('Admin123!', { memoryCost: 65536, timeCost: 3 });
  const userHash = await argon2.hash('Demo1234!', { memoryCost: 65536, timeCost: 3 });

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sarkariscout.in' },
    update: {},
    create: {
      email: 'admin@sarkariscout.in',
      passwordHash: adminHash,
      name: 'Admin',
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
  console.log('Admin:', admin.email);

  // Demo user - Rohit
  const rohit = await prisma.user.upsert({
    where: { email: 'rohit@example.com' },
    update: {},
    create: {
      email: 'rohit@example.com',
      passwordHash: userHash,
      name: 'Rohit Kumar',
      role: 'USER',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          educationLevel: 'Graduate',
          degrees: JSON.stringify(['B.E. Computer Science']),
          state: 'Maharashtra',
          district: 'Pune',
          languages: JSON.stringify(['Hindi', 'Marathi', 'English']),
          category: 'GEN',
          dob: new Date('2002-05-15'),
          gender: 'Male',
          examFamilies: JSON.stringify(['SSC', 'IBPS', 'RRB', 'MPSC']),
          keywords: JSON.stringify(['engineering', 'computer science']),
        },
      },
    },
  });
  console.log('Demo user:', rohit.email);

  // Test user - Priya
  const priya = await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: {
      email: 'priya@example.com',
      passwordHash: userHash,
      name: 'Priya Singh',
      role: 'USER',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          educationLevel: '12th Pass',
          state: 'Uttar Pradesh',
          district: 'Lucknow',
          languages: JSON.stringify(['Hindi', 'English']),
          category: 'OBC',
          dob: new Date('2000-08-20'),
          gender: 'Female',
          examFamilies: JSON.stringify(['SSC CHSL', 'SSC MTS', 'UP Police']),
        },
      },
    },
  });
  console.log('Test user:', priya.email);

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

  console.log('\n--- Login Credentials ---');
  console.log('Admin:  admin@sarkariscout.in / Admin123!');
  console.log('Rohit:  rohit@example.com / Demo1234!');
  console.log('Priya:  priya@example.com / Demo1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
