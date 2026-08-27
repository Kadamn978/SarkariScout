import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user, job sources and sample jobs...');

  // Create admin user
  const adminEmail = 'admin@sarkariscout.in';
  const adminPassword = 'Admin@12345';
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
  console.log('Admin user:', admin.email, '(password: Admin@12345)');

  // Create a test regular user
  const testEmail = 'test@sarkariscout.in';
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
  console.log('Test user:', testUser.email, '(password: Test@12345)');

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

  // 55 diverse jobs across all categories, states, and exam families
  const jobs = [
    // ── GOVERNMENT (National) ──
    {
      fingerprint: 'ssc-cgl-2026-001', org: 'Staff Selection Commission', title: 'SSC CGL 2026 — Combined Graduate Level Examination',
      postNames: JSON.stringify(['Assistant Audit Officer', 'Assistant Section Officer', 'Inspector', 'Sub Inspector']),
      totalVacancies: 18000, state: 'ALL_IN', category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate', 'Post Graduate']),
      ageMin: 18, ageMax: 32, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-15'),
      feePaymentEnd: new Date('2026-10-16'), examDate: new Date('2026-12-10'),
      status: 'OPEN' as const, applyUrl: 'https://ssc.gov.in/apply',
      officialNotificationUrl: 'https://ssc.gov.in/notification/cgl-2026',
      eligibilityCriteria: 'Graduate in any discipline. Age 18-32.',
      howToApply: 'Online at ssc.gov.in. Upload photo + signature.',
      examPattern: 'Tier-I: CBT (200 marks). Tier-II: CBT (600 marks).',
      selectionProcess: 'Computer Based Test → Descriptive → Document Verification → Final Merit',
    },
    {
      fingerprint: 'upsc-cse-2026-001', org: 'Union Public Service Commission', title: 'UPSC Civil Services Examination 2026 (IAS/IPS/IFS)',
      postNames: JSON.stringify(['IAS Officer', 'IPS Officer', 'IFS Officer', 'IRS Officer']),
      totalVacancies: 1100, state: 'ALL_IN', category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 21, ageMax: 32, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-02-01'), applyEnd: new Date('2026-03-15'),
      examDate: new Date('2026-06-01'), status: 'OPEN' as const,
      applyUrl: 'https://upsconline.nic.in',
      officialNotificationUrl: 'https://upsc.gov.in/examinations/active-examinations',
      eligibilityCriteria: 'Graduate. Age 21-32. Indian Citizen.',
      examPattern: 'Prelims (400 marks) → Mains (1750 marks) → Interview (275 marks)',
      selectionProcess: 'Preliminary → Mains → Personality Test → Final Merit',
    },
    {
      fingerprint: 'upsc-ese-2026-001', org: 'Union Public Service Commission', title: 'UPSC ESE 2026 — Engineering Services Examination',
      postNames: JSON.stringify(['Junior Engineer', 'Assistant Engineer', 'Executive Engineer']),
      totalVacancies: 600, state: 'ALL_IN', category: 'ENGINEERING' as const,
      qualificationText: 'Engineering degree in relevant discipline', qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 21, ageMax: 30, generalFee: 200, obcFee: 200, scStFee: 0,
      applyStart: new Date('2026-08-15'), applyEnd: new Date('2026-09-15'),
      examDate: new Date('2027-01-10'), status: 'OPEN' as const,
      applyUrl: 'https://upsconline.nic.in',
    },
    {
      fingerprint: 'upsc-nda-2026-001', org: 'Union Public Service Commission', title: 'UPSC NDA & NA Examination 2026',
      postNames: JSON.stringify(['Army Officer', 'Navy Officer', 'Air Force Officer']),
      totalVacancies: 400, state: 'ALL_IN', category: 'DEFENCE' as const,
      qualificationText: '12th Pass with Physics and Mathematics', qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 16, ageMax: 19, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-06-01'), applyEnd: new Date('2026-07-01'),
      examDate: new Date('2026-09-07'), status: 'OPEN' as const,
      applyUrl: 'https://upsconline.nic.in',
    },
    // ── BANKING ──
    {
      fingerprint: 'ibps-po-xiv-001', org: 'Institute of Banking Personnel Selection', title: 'IBPS PO XIV — Probationary Officer Recruitment',
      postNames: JSON.stringify(['Probationary Officer / Management Trainee']),
      totalVacancies: 4000, state: 'ALL_IN', category: 'BANKING' as const,
      qualificationText: 'Graduate in any discipline', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 20, ageMax: 30, generalFee: 850, obcFee: 850, scStFee: 175,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-08-31'),
      feePaymentEnd: new Date('2026-09-01'), examDate: new Date('2026-10-15'),
      status: 'OPEN' as const, applyUrl: 'https://ibps.in/careers',
      officialNotificationUrl: 'https://ibps.in/recruitment',
    },
    {
      fingerprint: 'ibps-clerk-xiv-001', org: 'Institute of Banking Personnel Selection', title: 'IBPS Clerk XIV — 8000 Vacancies',
      postNames: JSON.stringify(['Clerk / Single Window Operator']),
      totalVacancies: 8000, state: 'ALL_IN', category: 'BANKING' as const,
      qualificationText: 'Graduate in any discipline', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 20, ageMax: 28, generalFee: 850, obcFee: 850, scStFee: 175,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-09-30'),
      examDate: new Date('2026-12-05'), status: 'OPEN' as const,
      applyUrl: 'https://ibps.in/careers',
    },
    {
      fingerprint: 'sbi-clerk-2026-001', org: 'State Bank of India', title: 'SBI Junior Associate (Clerk) 2026 — 8000 Vacancies',
      postNames: JSON.stringify(['Junior Associate (Clerk)']),
      totalVacancies: 8000, state: 'ALL_IN', category: 'BANKING' as const,
      qualificationText: 'Graduate in any discipline', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 20, ageMax: 28, generalFee: 750, obcFee: 750, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-09-30'),
      status: 'OPEN' as const, applyUrl: 'https://sbi.co.in/careers',
    },
    {
      fingerprint: 'sbi-po-2026-001', org: 'State Bank of India', title: 'SBI Probationary Officer 2026 — 2000 Vacancies',
      postNames: JSON.stringify(['Probationary Officer']),
      totalVacancies: 2000, state: 'ALL_IN', category: 'BANKING' as const,
      qualificationText: 'Graduate in any discipline', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 21, ageMax: 30, generalFee: 750, obcFee: 750, scStFee: 0,
      applyStart: new Date('2026-10-01'), applyEnd: new Date('2026-10-31'),
      examDate: new Date('2027-01-15'), status: 'OPEN' as const,
      applyUrl: 'https://sbi.co.in/careers',
    },
    {
      fingerprint: 'rbi-grade-b-2026-001', org: 'Reserve Bank of India', title: 'RBI Grade B Officer 2026 — 300 Vacancies',
      postNames: JSON.stringify(['Grade B Officer (General)', 'Grade B Officer (DEPR)', 'Grade B Officer (DSIM)']),
      totalVacancies: 300, state: 'ALL_IN', category: 'BANKING' as const,
      qualificationText: 'Graduate with 60% marks. For DEPR: PG in Economics.', qualificationLevels: JSON.stringify(['Graduate', 'Post Graduate']),
      ageMin: 21, ageMax: 30, generalFee: 850, obcFee: 850, scStFee: 175,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-15'),
      examDate: new Date('2026-12-01'), status: 'OPEN' as const,
      applyUrl: 'https://rbi.org.in/careers',
    },
    // ── RAILWAY ──
    {
      fingerprint: 'rrb-ntpc-2026-001', org: 'Railway Recruitment Boards', title: 'RRB NTPC 2026 — 35000 Non-Technical Popular Categories',
      postNames: JSON.stringify(['Traffic Assistant', 'Goods Guard', 'Senior Time Keeper', 'Junior Account Assistant']),
      totalVacancies: 35000, state: 'ALL_IN', category: 'RAILWAY' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 18, ageMax: 33, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-30'),
      examDate: new Date('2027-01-15'), status: 'OPEN' as const,
      applyUrl: 'https://rrbapply.gov.in',
    },
    {
      fingerprint: 'rrb-aldp-2026-001', org: 'Railway Recruitment Boards', title: 'RRB ALP & Technician 2026 — 15000 Vacancies',
      postNames: JSON.stringify(['Assistant Loco Pilot', 'Technician']),
      totalVacancies: 15000, state: 'ALL_IN', category: 'RAILWAY' as const,
      qualificationText: 'ITI / Diploma in relevant trade. 10th + ITI minimum.',
      qualificationLevels: JSON.stringify(['10th Pass', 'ITI', 'Diploma']),
      ageMin: 18, ageMax: 30, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-08-15'), applyEnd: new Date('2026-09-30'),
      examDate: new Date('2026-12-20'), status: 'OPEN' as const,
      applyUrl: 'https://rrbapply.gov.in',
    },
    {
      fingerprint: 'rrb-group-d-2026-001', org: 'Railway Recruitment Boards', title: 'RRB Group D 2026 — 32000 Vacancies',
      postNames: JSON.stringify(['Track Maintainer', 'Helper', 'Assistant Pointsman']),
      totalVacancies: 32000, state: 'ALL_IN', category: 'RAILWAY' as const,
      qualificationText: '10th Pass + ITI / National Apprenticeship Certificate',
      qualificationLevels: JSON.stringify(['10th Pass', 'ITI']),
      ageMin: 18, ageMax: 33, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-10-01'), applyEnd: new Date('2026-11-15'),
      status: 'OPEN' as const, applyUrl: 'https://rrbapply.gov.in',
    },
    // ── PSU ──
    {
      fingerprint: 'ongc-gt-2026-001', org: 'Oil and Natural Gas Corporation', title: 'ONGC Graduate Trainee 2026 — 300 Vacancies',
      postNames: JSON.stringify(['Graduate Trainee (Engineering)', 'Graduate Trainee (Geology)', 'Graduate Trainee (Chemistry)']),
      totalVacancies: 300, state: 'ALL_IN', category: 'PSU' as const,
      qualificationText: 'Engineering degree with valid GATE 2026 score', qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 18, ageMax: 30, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      examDate: new Date('2027-02-15'), status: 'OPEN' as const,
      applyUrl: 'https://ongcindia.com/careers',
    },
    {
      fingerprint: 'ntpc-dt-2026-001', org: 'National Thermal Power Corporation', title: 'NTPC Diploma Trainee / Graduate Trainee 2026',
      postNames: JSON.stringify(['Diploma Trainee', 'Graduate Trainee (Engineering)', 'Executive (Finance)']),
      totalVacancies: 200, state: 'ALL_IN', category: 'PSU' as const,
      qualificationText: 'Diploma/B.E./B.Tech in relevant discipline', qualificationLevels: JSON.stringify(['Diploma', 'Engineering']),
      ageMin: 18, ageMax: 27, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-15'),
      status: 'OPEN' as const, applyUrl: 'https://ntpc.co.in/careers',
    },
    {
      fingerprint: 'cdac-recruit-2026-001', org: 'Centre for Development of Advanced Computing', title: 'CDAC Project Engineer / Manager 2026 — 150 Posts',
      postNames: JSON.stringify(['Project Engineer', 'Project Manager', 'Project Officer']),
      totalVacancies: 150, state: 'ALL_IN', category: 'IT' as const,
      qualificationText: 'B.E./B.Tech/MCA with relevant experience', qualificationLevels: JSON.stringify(['Engineering', 'Post Graduate']),
      ageMin: 21, ageMax: 40, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-08-20'), applyEnd: new Date('2026-09-20'),
      status: 'OPEN' as const, applyUrl: 'https://cdac.in/index.aspx',
    },
    {
      fingerprint: 'bel-intern-2026-001', org: 'Bharat Electronics Limited', title: 'BEL Graduate Apprentice Trainee 2026 — 100 Posts',
      postNames: JSON.stringify(['Graduate Apprentice (Electronics)', 'Graduate Apprentice (CS)']),
      totalVacancies: 100, state: 'Karnataka', category: 'PSU' as const,
      qualificationText: 'Engineering degree (2024-2026 batch)', qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 18, ageMax: 25, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-08-31'),
      status: 'OPEN' as const, applyUrl: 'https://bel-india.in',
    },
    {
      fingerprint: 'iocl-jr-2026-001', org: 'Indian Oil Corporation', title: 'IOCL Junior Engineer / Technician 2026 — 500 Posts',
      postNames: JSON.stringify(['Junior Engineer (Mechanical)', 'Junior Engineer (Electrical)', 'Technician']),
      totalVacancies: 500, state: 'ALL_IN', category: 'PSU' as const,
      qualificationText: 'Diploma/B.E. in relevant engineering discipline', qualificationLevels: JSON.stringify(['Diploma', 'Engineering']),
      ageMin: 18, ageMax: 30, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://iocl.com/careers',
    },
    // ── DEFENCE ──
    {
      fingerprint: 'indian-army-tdc-2026-001', org: 'Indian Army', title: 'Indian Army TGC-143 2026 — 40 Vacancies',
      postNames: JSON.stringify(['Lieutenant (Technical)', 'Lieutenant (Engineering)']),
      totalVacancies: 40, state: 'ALL_IN', category: 'DEFENCE' as const,
      qualificationText: 'Engineering degree from recognized university', qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 20, ageMax: 27, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-09-30'),
      status: 'OPEN' as const, applyUrl: 'https://joinindianarmy.nic.in',
    },
    {
      fingerprint: 'indian-navy-ssr-2026-001', org: 'Indian Navy', title: 'Indian Navy SSR (Senior Secondary Recruit) 2026 — 2500 Vacancies',
      postNames: JSON.stringify(['Sailor (SSR)', 'Sailor (AA)']),
      totalVacancies: 2500, state: 'ALL_IN', category: 'DEFENCE' as const,
      qualificationText: '12th Pass with Physics, Maths, and one of Chemistry/Biology/Computer Science',
      qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 17, ageMax: 21, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-07-01'), applyEnd: new Date('2026-08-15'),
      examDate: new Date('2026-11-01'), status: 'OPEN' as const,
      applyUrl: 'https://joinindiannavy.gov.in',
    },
    {
      fingerprint: 'indian-airforce-aga-2026-001', org: 'Indian Air Force', title: 'IAF Agniveer Vayu 2026 — 3000 Vacancies',
      postNames: JSON.stringify(['Agniveer Vayu (Science)', 'Agniveer Vayu (Other Than Science)']),
      totalVacancies: 3000, state: 'ALL_IN', category: 'DEFENCE' as const,
      qualificationText: '12th Pass with Science subjects OR 3-year Diploma',
      qualificationLevels: JSON.stringify(['12th Pass', 'Diploma']),
      ageMin: 17, ageMax: 21, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-07-15'), applyEnd: new Date('2026-08-30'),
      status: 'OPEN' as const, applyUrl: 'https://agnipathvayu.cdac.in',
    },
    {
      fingerprint: 'bsf-constable-2026-001', org: 'Border Security Force', title: 'BSF Constable (Tradesman) 2026 — 2000 Vacancies',
      postNames: JSON.stringify(['Constable (Carpenter)', 'Constable (Plumber)', 'Constable (Electrician)', 'Constable (Tailor)']),
      totalVacancies: 2000, state: 'ALL_IN', category: 'DEFENCE' as const,
      qualificationText: '10th Pass + ITI in relevant trade', qualificationLevels: JSON.stringify(['10th Pass', 'ITI']),
      ageMin: 18, ageMax: 25, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://bsf.gov.in',
    },
    // ── POLICE ──
    {
      fingerprint: 'maharashtra-police-2026-001', org: 'Maharashtra Police Department', title: 'Maharashtra Police Constable 2026 — 5000 Vacancies',
      postNames: JSON.stringify(['Police Constable', 'Armed Police Constable']),
      totalVacancies: 5000, state: 'Maharashtra', category: 'POLICE' as const,
      qualificationText: '12th Pass from recognized board', qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 18, ageMax: 28, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-15'),
      examDate: new Date('2027-01-20'), status: 'OPEN' as const,
      applyUrl: 'https://mahapolice.gov.in',
    },
    {
      fingerprint: 'up-police-2026-001', org: 'Uttar Pradesh Police Recruitment Board', title: 'UP Police Constable 2026 — 60000 Vacancies',
      postNames: JSON.stringify(['Constable', 'Head Constable']),
      totalVacancies: 60000, state: 'Uttar Pradesh', category: 'POLICE' as const,
      qualificationText: '12th Pass from recognized board', qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 18, ageMax: 25, generalFee: 400, obcFee: 400, scStFee: 200,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-09-15'),
      status: 'OPEN' as const, applyUrl: 'https://uppbpb.gov.in',
    },
    {
      fingerprint: 'delhi-police-2026-001', org: 'Delhi Police', title: 'Delhi Police Constable 2026 — 5000 Vacancies',
      postNames: JSON.stringify(['Constable (Executive Male)', 'Constable (Executive Female)']),
      totalVacancies: 5000, state: 'Delhi', category: 'POLICE' as const,
      qualificationText: '12th Pass from recognized board', qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 18, ageMax: 25, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://delhipolice.gov.in',
    },
    // ── STATE GOVERNMENT ──
    {
      fingerprint: 'mpsc-forest-2026-001', org: 'Maharashtra Public Service Commission', title: 'MPSC Forest Officer 2026 — 200 Vacancies',
      postNames: JSON.stringify(['Forest Officer', 'Range Forest Officer']),
      totalVacancies: 200, state: 'Maharashtra', category: 'GOVERNMENT' as const,
      qualificationText: 'Bachelor degree in Science/Engineering', qualificationLevels: JSON.stringify(['Graduate', 'Engineering']),
      ageMin: 18, ageMax: 38, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-09-30'),
      examDate: new Date('2026-12-20'), status: 'OPEN' as const,
      applyUrl: 'https://mpsc.gov.in',
    },
    {
      fingerprint: 'mpsc-psi-2026-001', org: 'Maharashtra Public Service Commission', title: 'MPSC Police Sub Inspector 2026 — 600 Vacancies',
      postNames: JSON.stringify(['Police Sub Inspector', 'Assistant State Inspector']),
      totalVacancies: 600, state: 'Maharashtra', category: 'POLICE' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 18, ageMax: 38, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-08-15'), applyEnd: new Date('2026-09-15'),
      status: 'OPEN' as const, applyUrl: 'https://mpsc.gov.in',
    },
    {
      fingerprint: 'mpsc-mps-2026-001', org: 'Maharashtra Public Service Commission', title: 'MPSC State Service Examination 2026 — 400 Vacancies',
      postNames: JSON.stringify(['Deputy Collector', 'Deputy Superintendent of Police', 'Assistant Commissioner']),
      totalVacancies: 400, state: 'Maharashtra', category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 21, ageMax: 38, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-08-31'),
      examDate: new Date('2026-11-15'), status: 'OPEN' as const,
      applyUrl: 'https://mpsc.gov.in',
    },
    {
      fingerprint: 'bpssc-police-2026-001', org: 'Bihar Public Service Commission', title: 'BPSC Police Sub Inspector 2026 — 2500 Vacancies',
      postNames: JSON.stringify(['Police Sub Inspector', 'Superintendent Police']),
      totalVacancies: 2500, state: 'Bihar', category: 'POLICE' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 18, ageMax: 25, generalFee: 700, obcFee: 700, scStFee: 200,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://bpsc.bih.nic.in',
    },
    {
      fingerprint: 'mppsc-2026-001', org: 'Madhya Pradesh Public Service Commission', title: 'MPPSC State Service 2026 — 350 Vacancies',
      postNames: JSON.stringify(['State Administrative Service Officer', 'Deputy Collector']),
      totalVacancies: 350, state: 'Madhya Pradesh', category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 21, ageMax: 40, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-15'),
      status: 'OPEN' as const, applyUrl: 'https://mppsc.mp.gov.in',
    },
    {
      fingerprint: 'tnpsc-group-2-2026-001', org: 'Tamil Nadu Public Service Commission', title: 'TNPSC Group 2 2026 — 500 Vacancies',
      postNames: JSON.stringify(['Subordinate Accounts Service', 'Probation Officer']),
      totalVacancies: 500, state: 'Tamil Nadu', category: 'GOVERNMENT' as const,
      qualificationText: 'Degree in any discipline', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 18, ageMax: 32, generalFee: 150, obcFee: 150, scStFee: 0,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-09-01'),
      status: 'OPEN' as const, applyUrl: 'https://tnpsc.gov.in',
    },
    {
      fingerprint: 'kpsc-group-c-2026-001', org: 'Karnataka Public Service Commission', title: 'KPSC Group C 2026 — 1200 Vacancies',
      postNames: JSON.stringify(['First Division Assistant', 'Second Division Assistant']),
      totalVacancies: 1200, state: 'Karnataka', category: 'GOVERNMENT' as const,
      qualificationText: 'Degree from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 18, ageMax: 35, generalFee: 300, obcFee: 300, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://kpsc.kar.nic.in',
    },
    {
      fingerprint: 'wbpsc-2026-001', org: 'West Bengal Public Service Commission', title: 'WBPSC WBCS 2026 — 450 Vacancies',
      postNames: JSON.stringify(['Executive Officer', 'Assistant Commissioner']),
      totalVacancies: 450, state: 'West Bengal', category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 21, ageMax: 36, generalFee: 210, obcFee: 210, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://wbpsc.gov.in',
    },
    // ── ENGINEERING ──
    {
      fingerprint: 'isro-recruit-2026-001', org: 'Indian Space Research Organisation', title: 'ISRO Scientist/Engineer 2026 — 300 Vacancies',
      postNames: JSON.stringify(['Scientist/Engineer (SC)', 'Scientist/Engineer (SD)']),
      totalVacancies: 300, state: 'ALL_IN', category: 'ENGINEERING' as const,
      qualificationText: 'B.E./B.Tech/M.E./M.Tech in relevant discipline with valid GATE score',
      qualificationLevels: JSON.stringify(['Engineering', 'Post Graduate']),
      ageMin: 18, ageMax: 35, generalFee: 250, obcFee: 250, scStFee: 0,
      applyStart: new Date('2026-08-15'), applyEnd: new Date('2026-09-15'),
      status: 'OPEN' as const, applyUrl: 'https://www.isro.gov.in/careers',
    },
    {
      fingerprint: 'drdo-recruit-2026-001', org: 'Defence Research and Development Organisation', title: 'DRDO Scientist B 2026 — 200 Vacancies',
      postNames: JSON.stringify(['Scientist B (Electronics)', 'Scientist B (Mechanical)', 'Scientist B (Computer Science)']),
      totalVacancies: 200, state: 'ALL_IN', category: 'ENGINEERING' as const,
      qualificationText: 'B.E./B.Tech with valid GATE 2026 score', qualificationLevels: JSON.stringify(['Engineering']),
      ageMin: 21, ageMax: 28, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://drdo.gov.in/careers',
    },
    {
      fingerprint: 'nhai-recruit-2026-001', org: 'National Highways Authority of India', title: 'NHAI Deputy Manager 2026 — 100 Vacancies',
      postNames: JSON.stringify(['Deputy Manager (Technical)', 'Deputy Manager (Finance)']),
      totalVacancies: 100, state: 'ALL_IN', category: 'ENGINEERING' as const,
      qualificationText: 'B.E./B.Tech for Technical, MBA Finance for Finance', qualificationLevels: JSON.stringify(['Engineering', 'Post Graduate']),
      ageMin: 21, ageMax: 30, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-15'),
      status: 'OPEN' as const, applyUrl: 'https://nhai.gov.in',
    },
    // ── SSC ──
    {
      fingerprint: 'ssc-chsl-2026-001', org: 'Staff Selection Commission', title: 'SSC CHSL 2026 — 25000 Vacancies',
      postNames: JSON.stringify(['Lower Division Clerk', 'Junior Secretariat Assistant', 'Postal Assistant']),
      totalVacancies: 25000, state: 'ALL_IN', category: 'GOVERNMENT' as const,
      qualificationText: '12th Pass from recognized board', qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 18, ageMax: 27, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      examDate: new Date('2026-12-15'), status: 'OPEN' as const,
      applyUrl: 'https://ssc.gov.in',
    },
    {
      fingerprint: 'ssc-mts-2026-001', org: 'Staff Selection Commission', title: 'SSC MTS & Havaldar 2026 — 15000 Vacancies',
      postNames: JSON.stringify(['Multi Tasking Staff', 'Havaldar']),
      totalVacancies: 15000, state: 'ALL_IN', category: 'GOVERNMENT' as const,
      qualificationText: '10th Pass from recognized board', qualificationLevels: JSON.stringify(['10th Pass']),
      ageMin: 18, ageMax: 25, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-08-15'), applyEnd: new Date('2026-09-15'),
      status: 'OPEN' as const, applyUrl: 'https://ssc.gov.in',
    },
    {
      fingerprint: 'ssc-steno-2026-001', org: 'Staff Selection Commission', title: 'SSC Stenographer 2026 — 3000 Vacancies',
      postNames: JSON.stringify(['Stenographer Grade C', 'Stenographer Grade D']),
      totalVacancies: 3000, state: 'ALL_IN', category: 'GOVERNMENT' as const,
      qualificationText: '12th Pass from recognized board', qualificationLevels: JSON.stringify(['12th Pass']),
      ageMin: 18, ageMax: 27, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-10-01'), applyEnd: new Date('2026-10-31'),
      status: 'OPEN' as const, applyUrl: 'https://ssc.gov.in',
    },
    {
      fingerprint: 'ssc-je-2026-001', org: 'Staff Selection Commission', title: 'SSC Junior Engineer 2026 — 2000 Vacancies',
      postNames: JSON.stringify(['Junior Engineer (Civil)', 'Junior Engineer (Electrical)', 'Junior Engineer (Mechanical)']),
      totalVacancies: 2000, state: 'ALL_IN', category: 'ENGINEERING' as const,
      qualificationText: 'Diploma/B.E. in relevant engineering discipline', qualificationLevels: JSON.stringify(['Diploma', 'Engineering']),
      ageMin: 18, ageMax: 32, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://ssc.gov.in',
    },
    // ── TEACHING ──
    {
      fingerprint: 'kvs-tgt-pgt-2026-001', org: 'Kendriya Vidyalaya Sangathan', title: 'KVS PGT/TGT 2026 — 1500 Vacancies',
      postNames: JSON.stringify(['PGT (Post Graduate Teacher)', 'TGT (Trained Graduate Teacher)']),
      totalVacancies: 1500, state: 'ALL_IN', category: 'TEACHING' as const,
      qualificationText: 'PG + B.Ed for PGT, Grad + B.Ed for TGT', qualificationLevels: JSON.stringify(['Graduate', 'Post Graduate']),
      ageMin: 18, ageMax: 35, generalFee: 1000, obcFee: 1000, scStFee: 500,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://kvsangathan.nic.in',
    },
    {
      fingerprint: 'dsssb-tgt-2026-001', org: 'Delhi Subordinate Services Selection Board', title: 'DSSSB TGT/PGT 2026 — 800 Vacancies',
      postNames: JSON.stringify(['TGT (Trained Graduate Teacher)', 'PGT (Post Graduate Teacher)']),
      totalVacancies: 800, state: 'Delhi', category: 'TEACHING' as const,
      qualificationText: 'PG + B.Ed for PGT, Grad + B.Ed for TGT', qualificationLevels: JSON.stringify(['Graduate', 'Post Graduate']),
      ageMin: 18, ageMax: 35, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-09-01'),
      status: 'OPEN' as const, applyUrl: 'https://dsssb.delhi.gov.in',
    },
    // ── MEDICAL ──
    {
      fingerprint: 'aiims-nursing-2026-001', org: 'All India Institute of Medical Sciences', title: 'AIIMS Nursing Officer 2026 — 2000 Vacancies',
      postNames: JSON.stringify(['Nursing Officer', 'Staff Nurse']),
      totalVacancies: 2000, state: 'ALL_IN', category: 'MEDICAL' as const,
      qualificationText: 'B.Sc Nursing / GNM + 1 year experience', qualificationLevels: JSON.stringify(['Graduate', 'Diploma']),
      ageMin: 18, ageMax: 35, generalFee: 1500, obcFee: 1500, scStFee: 1200,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://aiimsexams.ac.in',
    },
    {
      fingerprint: 'esic-nurse-2026-001', org: 'Employees State Insurance Corporation', title: 'ESIC Staff Nurse 2026 — 1000 Vacancies',
      postNames: JSON.stringify(['Staff Nurse', 'Nursing Tutor']),
      totalVacancies: 1000, state: 'ALL_IN', category: 'MEDICAL' as const,
      qualificationText: 'B.Sc Nursing / GNM', qualificationLevels: JSON.stringify(['Graduate', 'Diploma']),
      ageMin: 18, ageMax: 32, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-08-15'), applyEnd: new Date('2026-09-15'),
      status: 'OPEN' as const, applyUrl: 'https://esic.nic.in',
    },
    // ── PRIVATE (IT/TECH) ──
    {
      fingerprint: 'bsnl-jao-2026-001', org: 'Bharat Sanchar Nigam Limited', title: 'BSNL JTO 2026 — 500 Vacancies',
      postNames: JSON.stringify(['Junior Telecom Officer (Telecom)', 'Junior Telecom Officer (Finance)']),
      totalVacancies: 500, state: 'ALL_IN', category: 'IT' as const,
      qualificationText: 'B.E./B.Tech for Telecom, B.Com/MBA for Finance', qualificationLevels: JSON.stringify(['Engineering', 'Graduate']),
      ageMin: 18, ageMax: 30, generalFee: 500, obcFee: 500, scStFee: 250,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-15'),
      status: 'OPEN' as const, applyUrl: 'https://bsnl.co.in',
    },
    {
      fingerprint: 'ntro-hacker-2026-001', org: 'National Technical Research Organisation', title: 'NTRO Technical Officer 2026 — 100 Vacancies',
      postNames: JSON.stringify(['Technical Officer (Cyber Security)', 'Technical Officer (Networking)']),
      totalVacancies: 100, state: 'ALL_IN', category: 'IT' as const,
      qualificationText: 'B.E./B.Tech/MCA in CS/IT/ECE with 60% marks', qualificationLevels: JSON.stringify(['Engineering', 'Post Graduate']),
      ageMin: 18, ageMax: 30, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-09-01'),
      status: 'OPEN' as const, applyUrl: 'https://ntro.gov.in',
    },
    // ── INTERNSHIP/TRAINING ──
    {
      fingerprint: 'drdo-intern-2026-001', org: 'DRDO', title: 'DRDO Apprenticeship 2026 — 200 Posts',
      postNames: JSON.stringify(['Graduate Apprentice', 'Technician Apprentice']),
      totalVacancies: 200, state: 'ALL_IN', category: 'INTERNSHIP' as const,
      qualificationText: 'B.E./B.Tech (fresher) for Graduate, Diploma for Technician',
      qualificationLevels: JSON.stringify(['Diploma', 'Engineering']),
      ageMin: 18, ageMax: 25, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-09-30'),
      status: 'OPEN' as const, applyUrl: 'https://apprenticeshipindia.gov.in',
    },
    {
      fingerprint: 'ntpc-intern-2026-001', org: 'NTPC', title: 'NTPC Apprenticeship 2026 — 300 Posts',
      postNames: JSON.stringify(['Trade Apprentice', 'Graduate Apprentice']),
      totalVacancies: 300, state: 'ALL_IN', category: 'INTERNSHIP' as const,
      qualificationText: 'ITI / B.E./B.Tech (2024-2026 batch)',
      qualificationLevels: JSON.stringify(['ITI', 'Engineering']),
      ageMin: 18, ageMax: 25, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-08-31'),
      status: 'OPEN' as const, applyUrl: 'https://apprenticeshipindia.gov.in',
    },
    // ── MORE GOVERNMENT ──
    {
      fingerprint: 'ias-prelims-2026-001', org: 'Union Public Service Commission', title: 'IAS Prelims 2026 Registration Open',
      postNames: JSON.stringify(['IAS', 'IPS', 'IFS', 'IRS', 'IAAS']),
      totalVacancies: 1100, state: 'ALL_IN', category: 'GOVERNMENT' as const,
      qualificationText: 'Graduate from any recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 21, ageMax: 32, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-02-01'), applyEnd: new Date('2026-03-15'),
      examDate: new Date('2026-06-01'), status: 'OPEN' as const,
      applyUrl: 'https://upsconline.nic.in',
    },
    {
      fingerprint: 'ssc-cpo-2026-001', org: 'Staff Selection Commission', title: 'SSC CPO 2026 — 5000 Sub Inspector Vacancies',
      postNames: JSON.stringify(['Sub Inspector (Delhi Police)', 'Sub Inspector (CAPF)', 'Sub Inspector (BSF)']),
      totalVacancies: 5000, state: 'ALL_IN', category: 'DEFENCE' as const,
      qualificationText: 'Graduate from recognized university', qualificationLevels: JSON.stringify(['Graduate']),
      ageMin: 20, ageMax: 25, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-09-15'), applyEnd: new Date('2026-10-15'),
      status: 'OPEN' as const, applyUrl: 'https://ssc.gov.in',
    },
    {
      fingerprint: 'railway-apprentice-2026-001', org: 'Railway Recruitment Cell', title: 'Railway Apprentice 2026 — 5000 Vacancies',
      postNames: JSON.stringify(['Trade Apprentice', 'Graduate Apprentice']),
      totalVacancies: 5000, state: 'ALL_IN', category: 'RAILWAY' as const,
      qualificationText: 'ITI / B.E./B.Tech', qualificationLevels: JSON.stringify(['ITI', 'Engineering']),
      ageMin: 18, ageMax: 24, generalFee: 100, obcFee: 100, scStFee: 0,
      applyStart: new Date('2026-08-01'), applyEnd: new Date('2026-09-01'),
      status: 'OPEN' as const, applyUrl: 'https://rrc.indianrailways.gov.in',
    },
    {
      fingerprint: 'niit-recruitment-2026-001', org: 'National Institute of Information Technology', title: 'NIIT University Faculty 2026 — 50 Vacancies',
      postNames: JSON.stringify(['Assistant Professor', 'Associate Professor']),
      totalVacancies: 50, state: 'ALL_IN', category: 'TEACHING' as const,
      qualificationText: 'Ph.D./NET/SET qualified', qualificationLevels: JSON.stringify(['Post Graduate', 'PhD']),
      ageMin: 25, ageMax: 45, generalFee: 0, obcFee: 0, scStFee: 0,
      applyStart: new Date('2026-09-01'), applyEnd: new Date('2026-10-01'),
      status: 'OPEN' as const, applyUrl: 'https://niituniversity.in',
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { fingerprint: job.fingerprint },
      update: {},
      create: job,
    });
  }
  console.log('Jobs seeded:', jobs.length);
  console.log('Seed complete. Users register via Google SSO or email signup.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
