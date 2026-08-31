const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const competitors = [
  // === CENTRAL (ALL_IN) ===
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
  { name: "IndGovtJobs.in", domain: "indgovtjobs.in", state: "ALL_IN", category: "Central Job", ranking: 22 },
  { name: "GovernmentJobOnline.in", domain: "governmentjobonline.in", state: "ALL_IN", category: "Central Job", ranking: 23 },
  { name: "India.gov.in (Jobs)", domain: "india.gov.in", officialDomain: "india.gov.in", state: "ALL_IN", category: "Central Job", ranking: 24 },
  { name: "PlacementStore.com", domain: "placementstore.com", state: "ALL_IN", category: "Central Job", ranking: 25 },

  // === UTTAR PRADESH ===
  { name: "UPPSC Official", domain: "uppsc.up.nic.in", officialDomain: "uppsc.up.nic.in", state: "Uttar Pradesh", category: "State PSC", ranking: 1 },
  { name: "UPSSSC Official", domain: "upsssc.gov.in", officialDomain: "upsssc.gov.in", state: "Uttar Pradesh", category: "State PSC", ranking: 2 },
  { name: "Rojgaar Sangam UP", domain: "rojgaarsangam.up.gov.in", officialDomain: "rojgaarsangam.up.gov.in", state: "Uttar Pradesh", category: "State Job Portal", ranking: 3 },
  { name: "SarkariUjala.com", domain: "sarkariujala.com", state: "Uttar Pradesh", category: "State Job Portal", ranking: 4 },
  { name: "UPJob.in", domain: "upjob.in", state: "Uttar Pradesh", category: "State Job Portal", ranking: 5 },
  { name: "GovtSelection.com", domain: "govtselection.com", state: "Uttar Pradesh", category: "State Job Portal", ranking: 6 },
  { name: "SarkariJob.com", domain: "sarkarijob.com", state: "Uttar Pradesh", category: "State Job Portal", ranking: 7 },
  { name: "SarkariPrep.in (UP)", domain: "sarkariprep.in", state: "Uttar Pradesh", category: "State Job Portal", ranking: 8 },
  { name: "ProJobAlert.com", domain: "projobalert.com", state: "Uttar Pradesh", category: "State Job Portal", ranking: 9 },

  // === BIHAR ===
  { name: "BPSC Official", domain: "bpsc.bih.nic.in", officialDomain: "bpsc.bih.nic.in", state: "Bihar", category: "State PSC", ranking: 1 },
  { name: "Online BPSC Portal", domain: "onlinebpsc.bihar.gov.in", officialDomain: "onlinebpsc.bihar.gov.in", state: "Bihar", category: "State PSC", ranking: 2 },
  { name: "BiharJob.co.in", domain: "biharjob.co.in", state: "Bihar", category: "State Job Portal", ranking: 3 },
  { name: "BiharJobPortal.com", domain: "biharjobportal.com", state: "Bihar", category: "State Job Portal", ranking: 4 },
  { name: "BiharJobFind.com", domain: "biharjobfind.com", state: "Bihar", category: "State Job Portal", ranking: 5 },
  { name: "State Bihar Portal", domain: "state.bihar.gov.in", officialDomain: "state.bihar.gov.in", state: "Bihar", category: "State Job Portal", ranking: 6 },

  // === RAJASTHAN ===
  { name: "RPSC Official", domain: "rpsc.rajasthan.gov.in", officialDomain: "rpsc.rajasthan.gov.in", state: "Rajasthan", category: "State PSC", ranking: 1 },
  { name: "RSMSSB Official", domain: "rsmssb.rajasthan.gov.in", officialDomain: "rsmssb.rajasthan.gov.in", state: "Rajasthan", category: "State PSC", ranking: 2 },
  { name: "Rajasthan Recruitment Portal", domain: "recruitment.rajasthan.gov.in", officialDomain: "recruitment.rajasthan.gov.in", state: "Rajasthan", category: "State Job Portal", ranking: 3 },
  { name: "SarkariJobs.com (Raj)", domain: "rajasthan.sarkarijobs.com", state: "Rajasthan", category: "State Job Portal", ranking: 4 },
  { name: "SabhiNaukri.com (Raj)", domain: "sabhinaukri.com", state: "Rajasthan", category: "State Job Portal", ranking: 5 },

  // === MADHYA PRADESH ===
  { name: "MPPSC Official", domain: "mppsc.mp.gov.in", officialDomain: "mppsc.mp.gov.in", state: "Madhya Pradesh", category: "State PSC", ranking: 1 },
  { name: "MPOnline Portal", domain: "mponline.gov.in", officialDomain: "mponline.gov.in", state: "Madhya Pradesh", category: "State Job Portal", ranking: 2 },
  { name: "MPESB Official", domain: "mpesb.mp.gov.in", officialDomain: "mpesb.mp.gov.in", state: "Madhya Pradesh", category: "State PSC", ranking: 3 },
  { name: "MPCareer.in", domain: "mpcareer.in", state: "Madhya Pradesh", category: "State Job Portal", ranking: 4 },
  { name: "MPRojgar Portal", domain: "mprojgar.gov.in", officialDomain: "mprojgar.gov.in", state: "Madhya Pradesh", category: "State Job Portal", ranking: 5 },

  // === MAHARASHTRA ===
  { name: "MPSC Official", domain: "mpsc.gov.in", officialDomain: "mpsc.gov.in", state: "Maharashtra", category: "State PSC", ranking: 1 },
  { name: "MaharashtraJobs.net", domain: "mahajobnet.com", state: "Maharashtra", category: "State Job Portal", ranking: 2 },

  // === TAMIL NADU ===
  { name: "TNPSC Official", domain: "tnpsc.gov.in", officialDomain: "tnpsc.gov.in", state: "Tamil Nadu", category: "State PSC", ranking: 1 },
  { name: "TNPSC Guide", domain: "tnpscguide.com", state: "Tamil Nadu", category: "State Job Portal", ranking: 2 },

  // === KARNATAKA ===
  { name: "KPSC Official", domain: "kpsc.kar.nic.in", officialDomain: "kpsc.kar.nic.in", state: "Karnataka", category: "State PSC", ranking: 1 },

  // === WEST BENGAL ===
  { name: "WBPSC Official", domain: "pscwbapplication.in", officialDomain: "pscwbapplication.in", state: "West Bengal", category: "State PSC", ranking: 1 },
  { name: "WBSSC Official", domain: "sscwb.nic.in", officialDomain: "sscwb.nic.in", state: "West Bengal", category: "State PSC", ranking: 2 },

  // === GUJARAT ===
  { name: "GPSC Official", domain: "gpsc.gujarat.gov.in", officialDomain: "gpsc.gujarat.gov.in", state: "Gujarat", category: "State PSC", ranking: 1 },
  { name: "OJAS Gujarat", domain: "ojas.gujarat.gov.in", officialDomain: "ojas.gujarat.gov.in", state: "Gujarat", category: "State Job Portal", ranking: 2 },

  // === ODISHA ===
  { name: "OPSC Official", domain: "opsc.gov.in", officialDomain: "opsc.gov.in", state: "Odisha", category: "State PSC", ranking: 1 },
  { name: "OSSC Official", domain: "ossc.gov.in", officialDomain: "ossc.gov.in", state: "Odisha", category: "State PSC", ranking: 2 },

  // === JHARKHAND ===
  { name: "JPSC Official", domain: "jpsc.gov.in", officialDomain: "jpsc.gov.in", state: "Jharkhand", category: "State PSC", ranking: 1 },
  { name: "JSSC Official", domain: "jssc.nic.in", officialDomain: "jssc.nic.in", state: "Jharkhand", category: "State PSC", ranking: 2 },

  // === CHHATTISGARH ===
  { name: "CGPSC Official", domain: "psc.cg.gov.in", officialDomain: "psc.cg.gov.in", state: "Chhattisgarh", category: "State PSC", ranking: 1 },

  // === ANDHRA PRADESH ===
  { name: "APPSC Official", domain: "psc.ap.gov.in", officialDomain: "psc.ap.gov.in", state: "Andhra Pradesh", category: "State PSC", ranking: 1 },

  // === TELANGANA ===
  { name: "TSPSC Official", domain: "tspsc.gov.in", officialDomain: "tspsc.gov.in", state: "Telangana", category: "State PSC", ranking: 1 },

  // === ASSAM ===
  { name: "APSC Official", domain: "apsc.nic.in", officialDomain: "apsc.nic.in", state: "Assam", category: "State PSC", ranking: 1 },

  // === PUNJAB ===
  { name: "PPSC Official", domain: "ppsc.gov.in", officialDomain: "ppsc.gov.in", state: "Punjab", category: "State PSC", ranking: 1 },

  // === HARYANA ===
  { name: "HPSC Official", domain: "hpsc.gov.in", officialDomain: "hpsc.gov.in", state: "Haryana", category: "State PSC", ranking: 1 },

  // === UTTARAKHAND ===
  { name: "UKPSC Official", domain: "ukpsc.gov.in", officialDomain: "ukpsc.gov.in", state: "Uttarakhand", category: "State PSC", ranking: 1 },

  // === HIMACHAL PRADESH ===
  { name: "HP PSC Official", domain: "hp.gov.in/hppsc", officialDomain: "hp.gov.in/hppsc", state: "Himachal Pradesh", category: "State PSC", ranking: 1 },

  // === KERALA ===
  { name: "Kerala PSC Official", domain: "keralapsc.gov.in", officialDomain: "keralapsc.gov.in", state: "Kerala", category: "State PSC", ranking: 1 },

  // === GOA ===
  { name: "Goa PSC Official", domain: "gpsc.goa.gov.in", officialDomain: "gpsc.goa.gov.in", state: "Goa", category: "State PSC", ranking: 1 },

  // === JAMMU & KASHMIR ===
  { name: "JKPSC Official", domain: "jkpsc.nic.in", officialDomain: "jkpsc.nic.in", state: "Jammu & Kashmir", category: "State PSC", ranking: 1 },
  { name: "JKSSB Official", domain: "jkssb.nic.in", officialDomain: "jkssb.nic.in", state: "Jammu & Kashmir", category: "State PSC", ranking: 2 },

  // === MANIPUR ===
  { name: "Manipur PSC Official", domain: "mpscmanipur.gov.in", officialDomain: "mpscmanipur.gov.in", state: "Manipur", category: "State PSC", ranking: 1 },

  // === MEGHALAYA ===
  { name: "Meghalaya PSC Official", domain: "mpsc.nic.in", officialDomain: "mpsc.nic.in", state: "Meghalaya", category: "State PSC", ranking: 1 },

  // === MIZORAM ===
  { name: "Mizoram PSC Official", domain: "mpsc.mizoram.gov.in", officialDomain: "mpsc.mizoram.gov.in", state: "Mizoram", category: "State PSC", ranking: 1 },

  // === NAGALAND ===
  { name: "Nagaland PSC Official", domain: "npsc.nagaland.gov.in", officialDomain: "npsc.nagaland.gov.in", state: "Nagaland", category: "State PSC", ranking: 1 },

  // === SIKKIM ===
  { name: "Sikkim PSC Official", domain: "sikkimpsc.gov.in", officialDomain: "sikkimpsc.gov.in", state: "Sikkim", category: "State PSC", ranking: 1 },

  // === TRIPURA ===
  { name: "TPSC Official", domain: "tpr.gov.in/tpsc", officialDomain: "tpr.gov.in/tpsc", state: "Tripura", category: "State PSC", ranking: 1 },

  // === ARUNACHAL PRADESH ===
  { name: "Arunachal Pradesh PSC", domain: "appsc.gov.in", officialDomain: "appsc.gov.in", state: "Arunachal Pradesh", category: "State PSC", ranking: 1 },

  // === UNION TERRITORIES ===
  { name: "DSSSB Official", domain: "dsssb.delhi.gov.in", officialDomain: "dsssb.delhi.gov.in", state: "Delhi", category: "UT Job Portal", ranking: 1 },
  { name: "UPSC Official", domain: "upsc.gov.in", officialDomain: "upsc.gov.in", state: "Delhi", category: "UT Job Portal", ranking: 2 },
  { name: "Chandigarh Administration", domain: "chandigarh.gov.in", officialDomain: "chandigarh.gov.in", state: "Chandigarh", category: "UT Job Portal", ranking: 1 },
];

async function main() {
  console.log("🗑️  Deleting ALL existing competitors...");
  const deleted = await p.competitor.deleteMany();
  console.log(`   Deleted ${deleted.count} records\n`);

  console.log(`📥 Upserting ${competitors.length} competitors...`);
  for (const c of competitors) {
    await p.competitor.upsert({
      where: { domain: c.domain },
      update: { name: c.name, state: c.state, category: c.category, ranking: c.ranking, officialDomain: c.officialDomain || null },
      create: { name: c.name, domain: c.domain, state: c.state, category: c.category, ranking: c.ranking, officialDomain: c.officialDomain || null },
    });
  }

  const all = await p.competitor.findMany();
  console.log(`✅ Total competitors in DB: ${all.length}\n`);

  const byState = {};
  for (const c of all) {
    byState[c.state] = (byState[c.state] || 0) + 1;
  }

  console.log("📊 Counts by state:");
  console.log("─".repeat(40));
  for (const [state, count] of Object.entries(byState).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${state.padEnd(25)} ${count}`);
  }
  console.log("─".repeat(40));
  console.log(`  ${"TOTAL".padEnd(25)} ${all.length}`);

  await p.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  p.$disconnect();
  process.exit(1);
});
