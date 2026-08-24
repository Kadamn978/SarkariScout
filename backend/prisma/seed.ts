import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding job sources and sample jobs...');

  // Job sources — filled by crawler in production
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
  ];

  for (const s of sources) {
    await prisma.source.upsert({
      where: { id: s.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: s.name.toLowerCase().replace(/\s+/g, '-'), ...s },
    });
  }
  console.log('Sources seeded:', sources.length);

  // Sample jobs — diverse categories, realistic data
  const sampleJobs = [
    // GOVERNMENT
    {
      fingerprint: 'ssc-cgl-2026-001',
      org: 'Staff Selection Commission',
      title: 'SSC CGL 2026 - Combined Graduate Level Examination',
      postNames: JSON.stringify(['Assistant Audit Officer', 'Assistant Section Officer', 'Inspector']),
      totalVacancies: 18000,
      state: 'ALL_IN',
      category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from recognized university',
      qualificationLevels: JSON.stringify(['Graduate', 'Post Graduate']),
      ageMin: 18, ageMax: 32,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-15'),
      examDate: new Date('2026-12-10'),
      status: 'OPEN' as const,
      applyUrl: 'https://ssc.gov.in/apply',
    },
    {
      fingerprint: 'upsc-cse-2026-001',
      org: 'Union Public Service Commission',
      title: 'UPSC Civil Services Examination 2026 (IAS/IPS/IFS)',
      postNames: JSON.stringify(['IAS Officer', 'IPS Officer', 'IFS Officer']),
      totalVacancies: 1100,
      state: 'ALL_IN',
      category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from recognized university',
      qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 21, ageMax: 32,
      applyStart: new Date('2026-02-01'), applyEnd: new Date('2026-03-15'),
      examDate: new Date('2026-06-01'),
      status: 'OPEN' as const,
      applyUrl: 'https://upsc.gov.in',
    },
    // BANKING
    {
      fingerprint: 'ibps-po-xiv-001',
      org: 'Institute of Banking Personnel Selection',
      title: 'IBPS PO XIV - Probationary Officer Recruitment',
      postNames: JSON.stringify(['Probationary Officer / Management Trainee']),
      totalVacancies: 4000,
      state: 'ALL_IN',
      category: 'BANKING' as const,
      qualificationText: 'Graduate in any discipline',
      qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 20, ageMax: 30,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-08-31'),
      examDate: new Date('2026-10-15'),
      status: 'OPEN' as const,
      applyUrl: 'https://ibps.in/careers',
    },
    {
      fingerprint: 'sbi-clerk-2026-001',
      org: 'State Bank of India',
      title: 'SBI Junior Associate (Clerk) 2026 - 8000 Vacancies',
      postNames: JSON.stringify(['Junior Associate (Clerk)']),
      totalVacancies: 8000,
      state: 'ALL_IN',
      category: 'BANKING' as const,
      qualificationText: 'Graduate in any discipline',
      qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 20, ageMax: 28,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-09-30'),
      status: 'OPEN' as const,
      applyUrl: 'https://sbi.co.in/careers',
    },
    // RAILWAY
    {
      fingerprint: 'rrb-ntpc-2026-001',
      org: 'Railway Recruitment Boards',
      title: 'RRB NTPC 2026 - Non-Technical Popular Categories',
      postNames: JSON.stringify(['Traffic Assistant', 'Goods Guard', 'Senior Time Keeper']),
      totalVacancies: 35000,
      state: 'ALL_IN',
      category: 'RAILWAY' as const,
      qualificationText: 'Graduate from recognized university',
      qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 18, ageMax: 33,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-30'),
      examDate: new Date('2027-01-15'),
      status: 'OPEN' as const,
      applyUrl: 'https://rrbapply.gov.in',
    },
    // PSU
    {
      fingerprint: 'ongc-gt-2026-001',
      org: 'Oil and Natural Gas Corporation',
      title: 'ONGC Graduate Trainee 2026 - Engineering Discipline',
      postNames: JSON.stringify(['Graduate Trainee (Engineering)', 'Graduate Trainee (Geology)']),
      totalVacancies: 300,
      state: 'ALL_IN',
      category: 'PSU' as const,
      qualificationText: 'Engineering degree with valid GATE score',
      qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 18, ageMax: 30,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      examDate: new Date('2027-02-15'),
      status: 'OPEN' as const,
      applyUrl: 'https://ongcindia.com/careers',
    },
    {
      fingerprint: 'ntpc-dt-2026-001',
      org: 'National Thermal Power Corporation',
      title: 'NTPC Diploma Trainee / Graduate Trainee 2026',
      postNames: JSON.stringify(['Diploma Trainee', 'Graduate Trainee']),
      totalVacancies: 200,
      state: 'ALL_IN',
      category: 'PSU' as const,
      qualificationText: 'Diploma/B.E./B.Tech in relevant discipline',
      qualificationLevels: JSON.stringify(['Diploma', 'Engineering']),
      ageMin: 18, ageMax: 27,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-15'),
      status: 'OPEN' as const,
      applyUrl: 'https://ntpc.co.in/careers',
    },
    // DEFENCE
    {
      fingerprint: 'indian-army-tdc-2026-001',
      org: 'Indian Army',
      title: 'Indian Army Technical Graduate Course (TGC-143) 2026',
      postNames: JSON.stringify(['Lieutenant (Technical)', 'Lieutenant (Engineering)']),
      totalVacancies: 40,
      state: 'ALL_IN',
      category: 'DEFENCE' as const,
      qualificationText: 'Engineering degree from recognized university',
      qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 20, ageMax: 27,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-09-30'),
      status: 'OPEN' as const,
      applyUrl: 'https://joinindianarmy.nic.in',
    },
    // POLICE
    {
      fingerprint: 'maharashtra-police-2026-001',
      org: 'Maharashtra Police Department',
      title: 'Maharashtra Police Constable 2026 - 5000 Vacancies',
      postNames: JSON.stringify(['Police Constable', 'Armed Police Constable']),
      totalVacancies: 5000,
      state: 'Maharashtra',
      category: 'POLICE' as const,
      qualificationText: '12th Pass from recognized board',
      qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 18, ageMax: 28,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-15'),
      examDate: new Date('2027-01-20'),
      status: 'OPEN' as const,
      applyUrl: 'https://mahapolice.gov.in',
    },
    // ENGINEERING
    {
      fingerprint: 'upsc-ese-2026-001',
      org: 'Union Public Service Commission',
      title: 'UPSC ESE 2026 - Engineering Services Examination',
      postNames: JSON.stringify(['Junior Engineer', 'Assistant Engineer']),
      totalVacancies: 600,
      state: 'ALL_IN',
      category: 'ENGINEERING' as const,
      qualificationText: 'Engineering degree from recognized university',
      qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 21, ageMax: 30,
      applyStart: new Date('2026-08-15'), applyEnd: new Date('2026-09-15'),
      examDate: new Date('2027-01-10'),
      status: 'OPEN' as const,
      applyUrl: 'https://upsc.gov.in/examinations/apply-online',
    },
    // PRIVATE (IT)
    {
      fingerprint: 'cdac-recruit-2026-001',
      org: 'Centre for Development of Advanced Computing',
      title: 'CDAC Project Engineer / Project Manager Recruitment 2026',
      postNames: JSON.stringify(['Project Engineer', 'Project Manager', 'Project Officer']),
      totalVacancies: 150,
      state: 'ALL_IN',
      category: 'IT' as const,
      qualificationText: 'B.E./B.Tech/MCA with relevant experience',
      qualificationLevels: JSON.stringify(['Engineering', 'Post Graduate']),
      ageMin: 21, ageMax: 40,
      applyStart: new Date('2026-08-20'), applyEnd: new Date('2026-09-20'),
      status: 'OPEN' as const,
      applyUrl: 'https://cdac.in/index.aspx',
    },
    // TRAINING
    {
      fingerprint: 'bsf-constable-2026-001',
      org: 'Border Security Force',
      title: 'BSF Constable (Tradesman) 2026 - 2000 Vacancies',
      postNames: JSON.stringify(['Constable (Carpenter)', 'Constable (Plumber)', 'Constable (Electrician)']),
      totalVacancies: 2000,
      state: 'ALL_IN',
      category: 'DEFENCE' as const,
      qualificationText: '10th Pass + ITI in relevant trade',
      qualificationLevels: JSON.stringify(['10th Pass', 'ITI']),
      ageMin: 18, ageMax: 25,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const,
      applyUrl: 'https://bsf.gov.in',
    },
    // INTERNSHIP
    {
      fingerprint: 'bel-intern-2026-001',
      org: 'Bharat Electronics Limited',
      title: 'BEL Graduate Apprentice Trainee 2026 - 100 Positions',
      postNames: JSON.stringify(['Graduate Apprentice (Electronics)', 'Graduate Apprentice (Computer Science)']),
      totalVacancies: 100,
      state: 'Karnataka',
      category: 'INTERNSHIP' as const,
      qualificationText: 'Engineering degree (2024-2026 batch)',
      qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 18, ageMax: 25,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-08-31'),
      status: 'OPEN' as const,
      applyUrl: 'https://bel-india.in',
    },
    // STATE GOVERNMENT
    {
      fingerprint: 'mpsc-forest-2026-001',
      org: 'Maharashtra Public Service Commission',
      title: 'MPSC Forest Officer 2026',
      postNames: JSON.stringify(['Forest Officer', 'Range Forest Officer']),
      totalVacancies: 200,
      state: 'Maharashtra',
      category: 'GOVERNMENT' as const,
      qualificationText: 'Bachelor degree in Science/Engineering',
      qualificationLevels: JSON.stringify(['Graduate', 'Engineering']),
      ageMin: 18, ageMax: 38,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-09-30'),
      examDate: new Date('2026-12-20'),
      status: 'OPEN' as const,
      applyUrl: 'https://mpsc.gov.in',
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
  console.log('Seed complete. Users register via Google SSO or email signup.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
