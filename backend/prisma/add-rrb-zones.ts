import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rrbZones = [
    { id: 'rrb-mumbai', name: 'RRB Mumbai', baseUrl: 'https://rrbmumbai.gov.in', state: 'Maharashtra' },
    { id: 'rrb-kolkata', name: 'RRB Kolkata', baseUrl: 'https://rrbkolkata.gov.in', state: 'West Bengal' },
    { id: 'rrb-chennai', name: 'RRB Chennai', baseUrl: 'https://rrbchennai.gov.in', state: 'Tamil Nadu' },
    { id: 'rrb-delhi', name: 'RRB Delhi', baseUrl: 'https://rrbdelhi.gov.in', state: 'Delhi' },
    { id: 'rrb-bangalore', name: 'RRB Bangalore', baseUrl: 'https://rrbbnc.gov.in', state: 'Karnataka' },
    { id: 'rrb-allahabad', name: 'RRB Allahabad', baseUrl: 'https://rrbald.gov.in', state: 'Uttar Pradesh' },
    { id: 'rrb-bhopal', name: 'RRB Bhopal', baseUrl: 'https://rrbbhopal.gov.in', state: 'Madhya Pradesh' },
    { id: 'rrb-bhubaneswar', name: 'RRB Bhubaneswar', baseUrl: 'https://rrbbbs.gov.in', state: 'Odisha' },
    { id: 'rrb-gorakhpur', name: 'RRB Gorakhpur', baseUrl: 'https://rrbgkp.gov.in', state: 'Uttar Pradesh' },
    { id: 'rrb-guwahati', name: 'RRB Guwahati', baseUrl: 'https://rrbguwahati.gov.in', state: 'Assam' },
    { id: 'rrb-jammu', name: 'RRB Jammu', baseUrl: 'https://rrbjammu.gov.in', state: 'Jammu & Kashmir' },
    { id: 'rrb-patna', name: 'RRB Patna', baseUrl: 'https://rrbpatna.gov.in', state: 'Bihar' },
    { id: 'rrb-ranchi', name: 'RRB Ranchi', baseUrl: 'https://rrbranchi.gov.in', state: 'Jharkhand' },
    { id: 'rrb-secunderabad', name: 'RRB Secunderabad', baseUrl: 'https://rrbsecunderabad.gov.in', state: 'Telangana' },
    { id: 'rrb-siliguri', name: 'RRB Siliguri', baseUrl: 'https://rrbsiliguri.gov.in', state: 'West Bengal' },
    { id: 'rrb-thiruvananthapuram', name: 'RRB Thiruvananthapuram', baseUrl: 'https://rrbtvm.gov.in', state: 'Kerala' },
  ];

  let added = 0;
  for (const zone of rrbZones) {
    const existing = await prisma.source.findUnique({ where: { id: zone.id } });
    if (!existing) {
      await prisma.source.create({
        data: {
          id: zone.id,
          name: zone.name,
          type: 'HTML',
          baseUrl: zone.baseUrl,
          schedule: '0 */6 * * *',
          configJson: JSON.stringify({ rrbZone: true, state: zone.state }),
          enabled: true,
        },
      });
      added++;
      console.log('Added:', zone.name, '→', zone.state);
    } else {
      // Update configJson with state mapping
      await prisma.source.update({
        where: { id: zone.id },
        data: { configJson: JSON.stringify({ rrbZone: true, state: zone.state }) },
      });
      console.log('Updated:', zone.name, '→', zone.state);
    }
  }
  console.log(`\nRRB zones: ${added} added, ${rrbZones.length - added} already existed`);
}

main().then(() => prisma.$disconnect());
