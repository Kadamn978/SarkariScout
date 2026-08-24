import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock tests and previous papers...');

  // 5 Mock Tests with questions
  const tests = [
    {
      title: 'SSC CGL Quantitative Aptitude Mock 1',
      description: 'Practice quantitative aptitude questions for SSC CGL Tier-I.',
      examFamily: 'SSC',
      qualification: 'Graduate',
      totalQuestions: 10,
      totalMarks: 20,
      durationMinutes: 20,
      isPublished: true,
      questions: [
        { questionText: 'What is 25% of 480?', optionA: '100', optionB: '120', optionC: '130', optionD: '140', correctOption: 'B', explanation: '25% of 480 = 480/4 = 120', sortOrder: 1 },
        { questionText: 'If a boat goes 12 km downstream in 3 hours, what is its speed?', optionA: '3 km/h', optionB: '4 km/h', optionC: '6 km/h', optionD: '8 km/h', correctOption: 'B', explanation: 'Speed = 12/3 = 4 km/h', sortOrder: 2 },
        { questionText: 'A train 200m long crosses a pole in 20 seconds. What is its speed?', optionA: '10 m/s', optionB: '15 m/s', optionC: '20 m/s', optionD: '25 m/s', correctOption: 'A', explanation: 'Speed = 200/20 = 10 m/s', sortOrder: 3 },
        { questionText: 'What is the compound interest on Rs. 10000 at 10% for 2 years?', optionA: 'Rs. 2000', optionB: 'Rs. 2100', optionC: 'Rs. 2200', optionD: 'Rs. 2500', correctOption: 'B', explanation: 'CI = 10000(1.1)^2 - 10000 = 2100', sortOrder: 4 },
        { questionText: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What is the removed number?', optionA: '24', optionB: '26', optionC: '28', optionD: '30', correctOption: 'C', explanation: 'Removed = 5*20 - 4*18 = 100-72 = 28', sortOrder: 5 },
        { questionText: 'A can do a work in 10 days, B in 15 days. In how many days can they do it together?', optionA: '5', optionB: '6', optionC: '7', optionD: '8', correctOption: 'B', explanation: '1/10 + 1/15 = 1/6, so 6 days', sortOrder: 6 },
        { questionText: 'What is the HCF of 24, 36 and 60?', optionA: '6', optionB: '8', optionC: '10', optionD: '12', correctOption: 'D', explanation: 'HCF of 24, 36, 60 = 12', sortOrder: 7 },
        { questionText: 'A circle has radius 7 cm. What is its area?', optionA: '144 cm2', optionB: '154 cm2', optionC: '164 cm2', optionD: '174 cm2', correctOption: 'B', explanation: 'Area = pi*r^2 = 22/7 * 49 = 154', sortOrder: 8 },
        { questionText: 'If sin 30 = 0.5, what is cos 60?', optionA: '0.3', optionB: '0.4', optionC: '0.5', optionD: '0.6', correctOption: 'C', explanation: 'cos 60 = sin 30 = 0.5', sortOrder: 9 },
        { questionText: 'What is 15% of 360?', optionA: '44', optionB: '48', optionC: '54', optionD: '60', correctOption: 'C', explanation: '15% of 360 = 360 * 0.15 = 54', sortOrder: 10 },
      ],
    },
    {
      title: 'IBPS PO Reasoning Mock 1',
      description: 'Reasoning ability practice for IBPS PO preliminary exam.',
      examFamily: 'Banking',
      qualification: 'Graduate',
      totalQuestions: 10,
      totalMarks: 10,
      durationMinutes: 15,
      isPublished: true,
      questions: [
        { questionText: 'If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?', optionA: 'Uncle', optionB: 'Father', optionC: 'Brother', optionD: 'Grandfather', correctOption: 'A', explanation: 'A is brother of B, B is sister of C, so A is uncle of D', sortOrder: 1 },
        { questionText: 'Find the odd one out: 2, 5, 11, 17, 23, 29', optionA: '2', optionB: '11', optionC: '23', optionD: '29', correctOption: 'A', explanation: '2 is the only even prime', sortOrder: 2 },
        { questionText: 'In a certain code, MACHINE is written as LBHJODF. How is ROUTINE written?', optionA: 'QSTUJOF', optionB: 'SPVTJOF', optionC: 'QSTVKOF', optionD: 'QSTVJOF', correctOption: 'D', explanation: 'Each letter shifted by -1', sortOrder: 3 },
        { questionText: 'Pointing to a man, a woman says: "His mother is the only daughter of my mother." How is the woman related to the man?', optionA: 'Mother', optionB: 'Grandmother', optionC: 'Sister', optionD: 'Aunt', correctOption: 'A', explanation: 'Only daughter of her mother = herself, so mother', sortOrder: 4 },
        { questionText: 'If in a code, DELHI is coded as CCIDD, how is BOMBAY coded?', optionA: 'AALZX', optionB: 'AALYY', optionC: 'BAALZ', optionD: 'AALYZ', correctOption: 'D', explanation: 'Each letter shifted by -1', sortOrder: 5 },
        { questionText: 'Find the missing number: 3, 6, 12, 24, ?, 96', optionA: '36', optionB: '42', optionC: '48', optionD: '54', correctOption: 'C', explanation: 'Each number doubles', sortOrder: 6 },
        { questionText: 'Which word cannot be formed from ORGANIZATION?', optionA: 'RATION', optionB: 'NATION', optionC: 'ORGAN', optionD: 'ZORRO', correctOption: 'D', explanation: 'ZORRO needs two O and two R in sequence', sortOrder: 7 },
        { questionText: 'A is taller than B but shorter than C. D is taller than A. C is shorter than D. Who is the tallest?', optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D', correctOption: 'D', explanation: 'D > A > B, D > C, so D is tallest', sortOrder: 8 },
        { questionText: 'If MONDAY = 1, TUESDAY = 2, what is WEDNESDAY?', optionA: '3', optionB: '4', optionC: '5', optionD: '6', correctOption: 'A', explanation: 'WEDNESDAY is the 3rd day of the week', sortOrder: 9 },
        { questionText: 'Find the next in series: AZ, CX, FU, ?', optionA: 'IR', optionB: 'JQ', optionC: 'KP', optionD: 'LR', correctOption: 'C', explanation: 'Pattern: +2 letters each', sortOrder: 10 },
      ],
    },
    {
      title: 'UPSC CSE General Studies Mock 1',
      description: 'Indian Polity and Governance questions for UPSC Prelims.',
      examFamily: 'UPSC',
      qualification: 'Graduate',
      totalQuestions: 10,
      totalMarks: 20,
      durationMinutes: 18,
      isPublished: true,
      questions: [
        { questionText: 'The concept of Fundamental Rights in the Indian Constitution is borrowed from which country?', optionA: 'USA', optionB: 'UK', optionC: 'Canada', optionD: 'Australia', correctOption: 'A', explanation: 'Fundamental Rights are borrowed from USA', sortOrder: 1 },
        { questionText: 'Which Article of the Indian Constitution deals with the Right to Equality?', optionA: 'Article 12', optionB: 'Article 14', optionC: 'Article 19', optionD: 'Article 21', correctOption: 'B', explanation: 'Article 14 deals with equality before law', sortOrder: 2 },
        { questionText: 'The Rajya Sabha can delay a Money Bill for a maximum period of:', optionA: '7 days', optionB: '14 days', optionC: '30 days', optionD: '60 days', correctOption: 'B', explanation: 'Rajya Sabha can delay Money Bill max 14 days', sortOrder: 3 },
        { questionText: 'Which of the following is NOT a Fundamental Duty?', optionA: 'To pay taxes', optionB: 'To protect national monuments', optionC: 'To develop scientific temper', optionD: 'To defend the country', correctOption: 'A', explanation: 'Paying taxes is a legal duty, not a fundamental duty', sortOrder: 4 },
        { questionText: 'The Directive Principles of State Policy are:', optionA: 'Justiciable', optionB: 'Non-justiciable', optionC: 'Enforceable by courts', optionD: 'Binding on government', correctOption: 'B', explanation: 'DPSPs are non-justiciable and not enforceable', sortOrder: 5 },
        { questionText: 'Who appoints the Chief Justice of India?', optionA: 'Prime Minister', optionB: 'President', optionC: 'Parliament', optionD: 'Law Minister', correctOption: 'B', explanation: 'The President appoints the CJI under Article 124', sortOrder: 6 },
        { questionText: 'The 73rd Constitutional Amendment deals with:', optionA: 'Municipalities', optionB: 'Panchayati Raj', optionC: 'Fundamental Rights', optionD: 'Directive Principles', correctOption: 'B', explanation: '73rd Amendment established Panchayati Raj', sortOrder: 7 },
        { questionText: 'Which Schedule of the Indian Constitution contains the list of states?', optionA: 'First', optionB: 'Second', optionC: 'Seventh', optionD: 'Eighth', correctOption: 'A', explanation: 'First Schedule contains list of states and UTs', sortOrder: 8 },
        { questionText: 'The concept of "Procedure established by law" is from which constitution?', optionA: 'USA', optionB: 'UK', optionC: 'Japan', optionD: 'France', correctOption: 'C', explanation: 'Borrowed from Japanese Constitution', sortOrder: 9 },
        { questionText: 'Article 370 was related to:', optionA: 'Fundamental Rights', optionB: 'Special status of J&K', optionC: 'Emergency provisions', optionD: 'Amendment procedure', correctOption: 'B', explanation: 'Article 370 gave special status to J&K', sortOrder: 10 },
      ],
    },
    {
      title: 'RRB NTPC General Awareness Mock 1',
      description: 'General Awareness and Current Affairs for RRB NTPC.',
      examFamily: 'Railway',
      qualification: 'Graduate',
      totalQuestions: 10,
      totalMarks: 10,
      durationMinutes: 12,
      isPublished: true,
      questions: [
        { questionText: 'India\'s first nuclear power plant was established at:', optionA: 'Tarapur', optionB: 'Kalpakkam', optionC: 'Narora', optionD: 'Kakrapar', correctOption: 'A', explanation: 'Tarapur Atomic Power Station was the first', sortOrder: 1 },
        { questionText: 'The longest river in India is:', optionA: 'Ganga', optionB: 'Yamuna', optionC: 'Brahmaputra', optionD: 'Godavari', correctOption: 'A', explanation: 'Ganga is the longest river in India', sortOrder: 2 },
        { questionText: 'Which planet is known as the Red Planet?', optionA: 'Venus', optionB: 'Mars', optionC: 'Jupiter', optionD: 'Saturn', correctOption: 'B', explanation: 'Mars is called the Red Planet', sortOrder: 3 },
        { questionText: 'The headquarters of ISRO is at:', optionA: 'Mumbai', optionB: 'Bengaluru', optionC: 'Chennai', optionD: 'Hyderabad', correctOption: 'B', explanation: 'ISRO HQ is in Bengaluru', sortOrder: 4 },
        { questionText: 'Which vitamin is produced in the human body by sunlight?', optionA: 'Vitamin A', optionB: 'Vitamin B', optionC: 'Vitamin C', optionD: 'Vitamin D', correctOption: 'D', explanation: 'Vitamin D is synthesized by sunlight', sortOrder: 5 },
        { questionText: 'The Battle of Plassey was fought in which year?', optionA: '1757', optionB: '1764', optionC: '1857', optionD: '1947', correctOption: 'A', explanation: 'Battle of Plassey was in 1757', sortOrder: 6 },
        { questionText: 'Who wrote the national song "Vande Mataram"?', optionA: 'Rabindranath Tagore', optionB: 'Bankim Chandra Chattopadhyay', optionC: 'Mahatma Gandhi', optionD: 'Jawaharlal Nehru', correctOption: 'B', explanation: 'Written by Bankim Chandra Chattopadhyay', sortOrder: 7 },
        { questionText: 'The chemical formula of common salt is:', optionA: 'NaOH', optionB: 'NaCl', optionC: 'NaHCO3', optionD: 'Na2CO3', correctOption: 'B', explanation: 'Common salt = Sodium Chloride = NaCl', sortOrder: 8 },
        { questionText: 'Which gas is used in the manufacture of fertilizers?', optionA: 'Oxygen', optionB: 'Nitrogen', optionC: 'Carbon dioxide', optionD: 'Hydrogen', correctOption: 'B', explanation: 'Nitrogen is used for ammonia and fertilizers', sortOrder: 9 },
        { questionText: 'The Tropic of Cancer passes through how many Indian states?', optionA: '6', optionB: '7', optionC: '8', optionD: '9', correctOption: 'C', explanation: 'Passes through 8 states', sortOrder: 10 },
      ],
    },
    {
      title: 'SSC CHSL English Language Mock 1',
      description: 'English Language and Comprehension for SSC CHSL Tier-I.',
      examFamily: 'SSC',
      qualification: '12th Pass',
      totalQuestions: 10,
      totalMarks: 20,
      durationMinutes: 15,
      isPublished: true,
      questions: [
        { questionText: 'Choose the synonym of "ABUNDANT":', optionA: 'Scarce', optionB: 'Plentiful', optionC: 'Moderate', optionD: 'Limited', correctOption: 'B', explanation: 'Abundant means plentiful or in large quantity', sortOrder: 1 },
        { questionText: 'Choose the antonym of "COURAGE":', optionA: 'Bravery', optionB: 'Valor', optionC: 'Cowardice', optionD: 'Strength', correctOption: 'C', explanation: 'Cowardice is the opposite of courage', sortOrder: 2 },
        { questionText: 'Fill in the blank: He has been working hard ___ he wants to succeed.', optionA: 'because', optionB: 'although', optionC: 'unless', optionD: 'until', correctOption: 'A', explanation: 'Because indicates reason', sortOrder: 3 },
        { questionText: 'Find the error: Each of the boys have submitted their assignments.', optionA: 'Each of', optionB: 'the boys', optionC: 'have submitted', optionD: 'their assignments', correctOption: 'C', explanation: '"Each" takes singular verb: "has submitted"', sortOrder: 4 },
        { questionText: 'Choose the correctly spelled word:', optionA: 'Accomodation', optionB: 'Accommodation', optionC: 'Acomodation', optionD: 'Acomodation', correctOption: 'B', explanation: 'Correct spelling: Accommodation', sortOrder: 5 },
        { questionText: 'One word substitution: A person who loves books:', optionA: 'Bibliophile', optionB: 'Philatelist', optionC: 'Misanthrope', optionD: 'Anthropologist', correctOption: 'A', explanation: 'Bibliophile = book lover', sortOrder: 6 },
        { questionText: 'Change voice: "The teacher is teaching the students."', optionA: 'The students are being taught by the teacher', optionB: 'The students were taught by the teacher', optionC: 'The students have been taught by the teacher', optionD: 'The students are taught by the teacher', correctOption: 'A', explanation: 'Present continuous passive: are being taught', sortOrder: 7 },
        { questionText: 'Choose the correct preposition: She is fond ___ music.', optionA: 'at', optionB: 'in', optionC: 'of', optionD: 'for', correctOption: 'C', explanation: '"Fond of" is the correct preposition', sortOrder: 8 },
        { questionText: 'Idiom: "To burn the midnight oil" means:', optionA: 'To waste money', optionB: 'To work late at night', optionC: 'To get angry', optionD: 'To be lazy', correctOption: 'B', explanation: 'It means to work/study late at night', sortOrder: 9 },
        { questionText: 'Active voice: "The window was broken by the boy."', optionA: 'The boy breaks the window', optionB: 'The boy broke the window', optionC: 'The boy has broken the window', optionD: 'The boy is breaking the window', correctOption: 'B', explanation: 'Past simple passive to active: The boy broke the window', sortOrder: 10 },
      ],
    },
  ];

  for (const test of tests) {
    const { questions, ...testData } = test;
    const created = await prisma.mockTest.upsert({
      where: { id: testData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) },
      update: {},
      create: {
        id: testData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
        ...testData,
      },
    });
    for (const q of questions) {
      await prisma.mockQuestion.create({
        data: { testId: created.id, ...q },
      });
    }
    console.log(`Test created: ${testData.title} (${questions.length} questions)`);
  }

  // Previous Year Papers
  const papers = [
    { title: 'SSC CGL Tier-I 2025 Question Paper', examFamily: 'SSC', year: 2025, qualification: 'Graduate', downloadCount: 1250 },
    { title: 'SSC CGL Tier-II 2025 Question Paper', examFamily: 'SSC', year: 2025, qualification: 'Graduate', downloadCount: 890 },
    { title: 'UPSC CSE Prelims 2025 GS Paper I', examFamily: 'UPSC', year: 2025, qualification: 'Graduate', downloadCount: 2100 },
    { title: 'UPSC CSE Prelims 2025 GS Paper II (CSAT)', examFamily: 'UPSC', year: 2025, qualification: 'Graduate', downloadCount: 1800 },
    { title: 'IBPS PO Prelims 2025 Question Paper', examFamily: 'Banking', year: 2025, qualification: 'Graduate', downloadCount: 1500 },
    { title: 'IBPS PO Mains 2025 Question Paper', examFamily: 'Banking', year: 2025, qualification: 'Graduate', downloadCount: 1200 },
    { title: 'SBI Clerk Prelims 2025 Question Paper', examFamily: 'Banking', year: 2025, qualification: 'Graduate', downloadCount: 1800 },
    { title: 'RRB NTPC CBT-1 2025 Question Paper', examFamily: 'Railway', year: 2025, qualification: 'Graduate', downloadCount: 2400 },
    { title: 'RRB Group D 2025 Question Paper', examFamily: 'Railway', year: 2025, qualification: '10th Pass', downloadCount: 3100 },
    { title: 'SSC CHSL Tier-I 2025 Question Paper', examFamily: 'SSC', year: 2025, qualification: '12th Pass', downloadCount: 1600 },
    { title: 'SSC CGL Tier-I 2024 Question Paper', examFamily: 'SSC', year: 2024, qualification: 'Graduate', downloadCount: 2800 },
    { title: 'UPSC CSE Prelims 2024 GS Paper I', examFamily: 'UPSC', year: 2024, qualification: 'Graduate', downloadCount: 3500 },
    { title: 'UPSC CSE Prelims 2024 CSAT', examFamily: 'UPSC', year: 2024, qualification: 'Graduate', downloadCount: 2200 },
    { title: 'IBPS PO Prelims 2024 Question Paper', examFamily: 'Banking', year: 2024, qualification: 'Graduate', downloadCount: 2000 },
    { title: 'SBI PO Mains 2024 Question Paper', examFamily: 'Banking', year: 2024, qualification: 'Graduate', downloadCount: 1400 },
    { title: 'RRB ALP CBT 2024 Question Paper', examFamily: 'Railway', year: 2024, qualification: 'ITI', downloadCount: 1900 },
    { title: 'SSC MTS 2024 Question Paper', examFamily: 'SSC', year: 2024, qualification: '10th Pass', downloadCount: 2600 },
    { title: 'UPSC ESE Prelims 2024 Paper I', examFamily: 'Engineering', year: 2024, qualification: 'Engineering', downloadCount: 1100 },
    { title: 'GATE 2024 CS Question Paper', examFamily: 'Engineering', year: 2024, qualification: 'Engineering', downloadCount: 4200 },
    { title: 'NTA UGC NET 2024 Paper I', examFamily: 'Teaching', year: 2024, qualification: 'Post Graduate', downloadCount: 3000 },
  ];

  for (const paper of papers) {
    await prisma.previousPaper.create({ data: paper });
  }
  console.log(`Papers seeded: ${papers.length}`);

  console.log('Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
