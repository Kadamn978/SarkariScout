import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Demo1234!', { memoryCost: 65536, timeCost: 3 });

  const user = await prisma.user.upsert({
    where: { email: 'demo@sarkariradar.dev' },
    update: {},
    create: {
      email: 'demo@sarkariradar.dev',
      passwordHash,
      name: 'Rohit (Demo)',
      role: 'USER',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          educationLevel: 'UG',
          degrees: ['B.E. Computer Science'],
          state: 'Maharashtra',
          district: 'Pune',
          languages: ['Hindi', 'Marathi', 'English'],
          category: 'GEN',
          dob: new Date('2002-05-15'),
          gender: 'Male',
          examFamilies: ['SSC', 'IBPS', 'RRB', 'MPSC'],
          keywords: ['engineering', 'computer science'],
        },
      },
    },
    include: { profile: true },
  });

  console.log('Seeded demo user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
