// Seed verified government job exam sources
// Sources researched from careers360.com, sabhinaukri.com, examlover.com, freejobalert.com
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const competitors = [
  // === CENTRAL (ALL_IN) — Verified real websites ===
  { name: "SarkariResult.com", domain: "sarkariresult.com", state: "ALL_IN", category: "Central Job", ranking: 1 },
  { name: "FreeJobAlert.com", domain: "freejobalert.com", state: "ALL_IN", category: "Central Job", ranking: 2 },
  { name: "Employment News", domain: "employmentnews.gov.in", officialDomain: "employmentnews.gov.in", state: "ALL_IN", category: "Central Job", ranking: 3 },
  { name: "JagranJosh.com", domain: "jagranjosh.com", state: "ALL_IN", category: "Central Job", ranking: 4 },
  { name: "Testbook.com", domain: "testbook.com", state: "ALL_IN", category: "Central Job", ranking: 5 },
  { name: "Adda247.com", domain: "adda247.com", state: "ALL_IN", category: "Central Job", ranking: 6 },
  { name: "Gradeup.co", domain: "byjusexamprep.com", state: "ALL_IN", category: "Central Job", ranking: 7 },
  { name: "Embibe.com", domain: "embibe.com", state: "ALL_IN", category: "Central Job", ranking: 8 },
  { name: "Safalta.com", domain: "safalta.com", state: "ALL_IN", category: "Central Job", ranking: 9 },
  { name: "Prepp.in", domain: "prepp.in", state: "ALL_IN", category: "Central Job", ranking: 10 },
  { name: "OliveBoard.com", domain: "oliveboard.in", state: "ALL_IN", category: "Central Job", ranking: 11 },
  { name: "GKToday.in", domain: "gktoday.in", state: "ALL_IN", category: "Central Job", ranking: 12 },
  { name: "MahendraGuru.com", domain: "mahendraguru.com", state: "ALL_IN", category: "Central Job", ranking: 13 },
  { name: "IndiaTodayEducation", domain: "indiatoday.in", state: "ALL_IN", category: "Central Job", ranking: 14 },
  { name: "Careers360.com", domain: "careers360.com", state: "ALL_IN", category: "Central Job", ranking: 15 },
  { name: "GovtJobGuru.in", domain: "govtjobguru.in", state: "ALL_IN", category: "Central Job", ranking: 16 },
  { name: "GovtServiceInfo.com", domain: "govtserviceinfo.com", state: "ALL_IN", category: "Central Job", ranking: 17 },
  { name: "SarkariPrep.in", domain: "sarkariprep.in", state: "ALL_IN", category: "Central Job", ranking: 18 },
  { name: "ExamLover.com", domain: "examlover.com", state: "ALL_IN", category: "Central Job", ranking: 19 },
  { name: "SarkariJobPoint.com", domain: "sarkarijobpoint.com", state: "ALL_IN", category: "Central Job", ranking: 20 },
  { name: "SarkariJobs.com", domain: "sarkarijobs.com", state: "ALL_IN", category: "Central Job", ranking: 21 },
  { name: "PlacementStore.com", domain: "placementstore.com", state: "ALL_IN", category: "Central Job", ranking: 22 },
  { name: "SarkariNokrii.com", domain: "sarkarinokrii.com", state: "ALL_IN", category: "Central Job", ranking: 23 },
  { name: "GovernmentJobOnline.in", domain: "governmentjobonline.in", state: "ALL_IN", category: "Central Job", ranking: 24 },
  { name: "India.gov.in (Jobs)", domain: "india.gov.in", officialDomain: "india.gov.in", state: "ALL_IN", category: "Central Job", ranking: 25 },

  // === STATE PSC OFFICIAL WEBSITES (verified from careers360.com, sabhinaukri.com) ===
  // Andhra Pradesh
  { name: "APPSC Official", domain: "psc.ap.gov.in", officialDomain: "psc.ap.gov.in", state: "Andhra Pradesh", category: "State PSC", ranking: 1 },
  { name: "APPSC Guide", domain: "appsc.gov.in", officialDomain: "appsc.gov.in", state: "Andhra Pradesh", category: "State PSC", ranking: 2 },

  // Arunachal Pradesh
  { name: "Arunachal Pradesh PSC", domain: "appsc.gov.in", officialDomain: "appsc.gov.in", state: "Arunachal Pradesh", category: "State PSC", ranking: 1 },

  // Assam
  { name: "APSC Official", domain: "apsc.nic.in", officialDomain: "apsc.nic.in", state: "Assam", category: "State PSC", ranking: 1 },
  { name: "AssamJob.in", domain: "assamjob.in", state: "Assam", category: "State Job Portal", ranking: 2 },

  // Bihar
  { name: "BPSC Official", domain: "bpsc.bih.nic.in", officialDomain: "bpsc.bih.nic.in", state: "Bihar", category: "State PSC", ranking: 1 },
  { name: "BPSC Update", domain: "bpscupdate.com", state: "Bihar", category: "State Job Portal", ranking: 2 },
  { name: "Sarkari Result Bihar", domain: "sarkariresult.com", state: "Bihar", category: "State Job Portal", ranking: 3 },

  // Chhattisgarh
  { name: "CGPSC Official", domain: "psc.cg.gov.in", officialDomain: "psc.cg.gov.in", state: "Chhattisgarh", category: "State PSC", ranking: 1 },
  { name: "CGPSC Guide", domain: "cgpscguide.com", state: "Chhattisgarh", category: "State Job Portal", ranking: 2 },

  // Goa
  { name: "Goa PSC Official", domain: "gpsc.goa.gov.in", officialDomain: "gpsc.goa.gov.in", state: "Goa", category: "State PSC", ranking: 1 },

  // Gujarat
  { name: "GPSC Official", domain: "gpsc.gujarat.gov.in", officialDomain: "gpsc.gujarat.gov.in", state: "Gujarat", category: "State PSC", ranking: 1 },
  { name: "OJAS Gujarat", domain: "ojas.gujarat.gov.in", officialDomain: "ojas.gujarat.gov.in", state: "Gujarat", category: "State Job Portal", ranking: 2 },

  // Haryana
  { name: "HPSC Official", domain: "hpsc.gov.in", officialDomain: "hpsc.gov.in", state: "Haryana", category: "State PSC", ranking: 1 },
  { name: "HaryanaJobs.in", domain: "haryanajobs.in", state: "Haryana", category: "State Job Portal", ranking: 2 },

  // Himachal Pradesh
  { name: "HP PSC Official", domain: "hp.gov.in/hppsc", officialDomain: "hp.gov.in/hppsc", state: "Himachal Pradesh", category: "State PSC", ranking: 1 },

  // Jammu & Kashmir
  { name: "JKPSC Official", domain: "jkpsc.nic.in", officialDomain: "jkpsc.nic.in", state: "Jammu & Kashmir", category: "State PSC", ranking: 1 },
  { name: "JKSSB Official", domain: "jkssb.nic.in", officialDomain: "jkssb.nic.in", state: "Jammu & Kashmir", category: "State PSC", ranking: 2 },

  // Jharkhand
  { name: "JPSC Official", domain: "jpsc.gov.in", officialDomain: "jpsc.gov.in", state: "Jharkhand", category: "State PSC", ranking: 1 },
  { name: "JSSC Official", domain: "jssc.nic.in", officialDomain: "jssc.nic.in", state: "Jharkhand", category: "State PSC", ranking: 2 },

  // Karnataka
  { name: "KPSC Official", domain: "kpsc.kar.nic.in", officialDomain: "kpsc.kar.nic.in", state: "Karnataka", category: "State PSC", ranking: 1 },
  { name: "KarnatakaJobs.in", domain: "karnatakajobs.in", state: "Karnataka", category: "State Job Portal", ranking: 2 },

  // Kerala
  { name: "Kerala PSC Official", domain: "keralapsc.gov.in", officialDomain: "keralapsc.gov.in", state: "Kerala", category: "State PSC", ranking: 1 },
  { name: "KeralaJobs.in", domain: "keralajobs.in", state: "Kerala", category: "State Job Portal", ranking: 2 },

  // Madhya Pradesh
  { name: "MPPSC Official", domain: "mppsc.nic.in", officialDomain: "mppsc.nic.in", state: "Madhya Pradesh", category: "State PSC", ranking: 1 },
  { name: "MPOnline", domain: "mponline.gov.in", officialDomain: "mponline.gov.in", state: "Madhya Pradesh", category: "State Job Portal", ranking: 2 },
  { name: "MP Govt Career Hub", domain: "govtcareerhub.com", state: "Madhya Pradesh", category: "State Job Portal", ranking: 3 },

  // Maharashtra
  { name: "MPSC Official", domain: "mpsc.gov.in", officialDomain: "mpsc.gov.in", state: "Maharashtra", category: "State PSC", ranking: 1 },
  { name: "MaharashtraJobs.net", domain: "mahajobnet.com", state: "Maharashtra", category: "State Job Portal", ranking: 2 },

  // Manipur
  { name: "Manipur PSC Official", domain: "mpscmanipur.gov.in", officialDomain: "mpscmanipur.gov.in", state: "Manipur", category: "State PSC", ranking: 1 },

  // Meghalaya
  { name: "Meghalaya PSC Official", domain: "mpsc.nic.in", officialDomain: "mpsc.nic.in", state: "Meghalaya", category: "State PSC", ranking: 1 },

  // Mizoram
  { name: "Mizoram PSC Official", domain: "mpsc.mizoram.gov.in", officialDomain: "mpsc.mizoram.gov.in", state: "Mizoram", category: "State PSC", ranking: 1 },

  // Nagaland
  { name: "Nagaland PSC Official", domain: "npsc.nagaland.gov.in", officialDomain: "npsc.nagaland.gov.in", state: "Nagaland", category: "State PSC", ranking: 1 },

  // Odisha
  { name: "OPSC Official", domain: "opsc.gov.in", officialDomain: "opsc.gov.in", state: "Odisha", category: "State PSC", ranking: 1 },
  { name: "OSSC Official", domain: "ossc.gov.in", officialDomain: "ossc.gov.in", state: "Odisha", category: "State PSC", ranking: 2 },

  // Punjab
  { name: "PPSC Official", domain: "ppsc.gov.in", officialDomain: "ppsc.gov.in", state: "Punjab", category: "State PSC", ranking: 1 },
  { name: "PunjabJobs.in", domain: "punjabjobs.in", state: "Punjab", category: "State Job Portal", ranking: 2 },

  // Rajasthan
  { name: "RPSC Official", domain: "rpsc.rajasthan.gov.in", officialDomain: "rpsc.rajasthan.gov.in", state: "Rajasthan", category: "State PSC", ranking: 1 },
  { name: "RSMSSB Official", domain: "rsmssb.rajasthan.gov.in", officialDomain: "rsmssb.rajasthan.gov.in", state: "Rajasthan", category: "State PSC", ranking: 2 },
  { name: "SarkariExam Rajasthan", domain: "sarkariexam.com", state: "Rajasthan", category: "State Job Portal", ranking: 3 },

  // Sikkim
  { name: "Sikkim PSC Official", domain: "sikkimpsc.gov.in", officialDomain: "sikkimpsc.gov.in", state: "Sikkim", category: "State PSC", ranking: 1 },

  // Tamil Nadu
  { name: "TNPSC Official", domain: "tnpsc.gov.in", officialDomain: "tnpsc.gov.in", state: "Tamil Nadu", category: "State PSC", ranking: 1 },
  { name: "TNSpider.com", domain: "tnspider.com", state: "Tamil Nadu", category: "State Job Portal", ranking: 2 },
  { name: "TNPSC Guide", domain: "tnpscguide.com", state: "Tamil Nadu", category: "State Job Portal", ranking: 3 },

  // Telangana
  { name: "TSPSC Official", domain: "tspsc.gov.in", officialDomain: "tspsc.gov.in", state: "Telangana", category: "State PSC", ranking: 1 },
  { name: "TelanganaJobs.in", domain: "telanganajobs.in", state: "Telangana", category: "State Job Portal", ranking: 2 },

  // Tripura
  { name: "TPSC Official", domain: "tpr.gov.in/tpsc", officialDomain: "tpr.gov.in/tpsc", state: "Tripura", category: "State PSC", ranking: 1 },

  // Uttar Pradesh
  { name: "UPPSC Official", domain: "uppsc.up.nic.in", officialDomain: "uppsc.up.nic.in", state: "Uttar Pradesh", category: "State PSC", ranking: 1 },
  { name: "UPSSSC Official", domain: "upsssc.gov.in", officialDomain: "upsssc.gov.in", state: "Uttar Pradesh", category: "State PSC", ranking: 2 },
  { name: "Sarkari Ujala", domain: "sarkariujala.com", state: "Uttar Pradesh", category: "State Job Portal", ranking: 3 },

  // Uttarakhand
  { name: "UKPSC Official", domain: "ukpsc.gov.in", officialDomain: "ukpsc.gov.in", state: "Uttarakhand", category: "State PSC", ranking: 1 },

  // West Bengal
  { name: "WBPSC Official", domain: "pscwbapplication.in", officialDomain: "pscwbapplication.in", state: "West Bengal", category: "State PSC", ranking: 1 },
  { name: "WB Staff Selection", domain: "sscwb.nic.in", officialDomain: "sscwb.nic.in", state: "West Bengal", category: "State PSC", ranking: 2 },

  // === UNION TERRITORIES ===
  // Delhi
  { name: "DSSSB Official", domain: "dsssb.delhi.gov.in", officialDomain: "dsssb.delhi.gov.in", state: "Delhi", category: "UT Job Portal", ranking: 1 },
  { name: "UPSC Official", domain: "upsc.gov.in", officialDomain: "upsc.gov.in", state: "Delhi", category: "UT Job Portal", ranking: 2 },

  // Chandigarh
  { name: "Chandigarh Administration", domain: "chandigarh.gov.in", officialDomain: "chandigarh.gov.in", state: "Chandigarh", category: "UT Job Portal", ranking: 1 },
];

async function main() {
  // Clear all existing competitors
  const deleted = await p.competitor.deleteMany();
  console.log(`Deleted ${deleted.count} old competitors`);

  // Insert new verified competitors
  let created = 0;
  for (const c of competitors) {
    try {
      await p.competitor.create({
        data: {
          name: c.name,
          domain: c.domain,
          officialDomain: c.officialDomain || null,
          state: c.state,
          category: c.category,
          ranking: c.ranking,
          status: "ACTIVE",
        },
      });
      created++;
    } catch (e) {
      console.error(`Failed: ${c.name} (${e.message})`);
    }
  }

  // Count by state
  const all = await p.competitor.findMany({ select: { state: true } });
  const byState = {};
  all.forEach(c => { byState[c.state] = (byState[c.state] || 0) + 1; });

  console.log(`\nCreated ${created} competitors`);
  console.log("\nBy state:");
  Object.keys(byState).sort().forEach(s => console.log(`  ${s}: ${byState[s]}`));
  console.log(`\nTotal: ${all.length}`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
