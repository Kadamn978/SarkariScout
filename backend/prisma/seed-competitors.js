const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const competitors = [
  // === CENTRAL COMPETITORS (top 25) ===
  { name: 'SarkariResult.com', domain: 'sarkariresult.com', category: 'Central Job', state: 'ALL_IN', ranking: 1 },
  { name: 'FreeJobAlert.com', domain: 'freejobalert.com', category: 'Central Job', state: 'ALL_IN', ranking: 2 },
  { name: 'FreshersLive.com', domain: 'fresherslive.com', category: 'Central Job', state: 'ALL_IN', ranking: 3 },
  { name: 'JagranJosh.com', domain: 'jagranjosh.com', category: 'Central Job', state: 'ALL_IN', ranking: 4 },
  { name: 'IndiaTodayEducation.com', domain: 'indiatoday.in/education-today', category: 'Central Job', state: 'ALL_IN', ranking: 5 },
  { name: 'Testbook.com', domain: 'testbook.com', category: 'Central Job', state: 'ALL_IN', ranking: 6 },
  { name: 'Adda247.com', domain: 'adda247.com', category: 'Central Job', state: 'ALL_IN', ranking: 7 },
  { name: 'Gradeup.co', domain: 'gradeup.co', category: 'Central Job', state: 'ALL_IN', ranking: 8 },
  { name: 'Embibe.com', domain: 'embibe.com', category: 'Central Job', state: 'ALL_IN', ranking: 9 },
  { name: 'Safalta.com', domain: 'safalta.com', category: 'Central Job', state: 'ALL_IN', ranking: 10 },
  { name: 'CareerPower.com', domain: 'careerpower.com', category: 'Central Job', state: 'ALL_IN', ranking: 11 },
  { name: 'SSCAdda.com', domain: 'sscadda.com', category: 'Central Job', state: 'ALL_IN', ranking: 12 },
  { name: 'BankersAdda.com', domain: 'bankersadda.com', category: 'Central Job', state: 'ALL_IN', ranking: 13 },
  { name: 'RRBAdda.com', domain: 'rrbadda.com', category: 'Central Job', state: 'ALL_IN', ranking: 14 },
  { name: 'IBPSGuide.com', domain: 'ibpsguide.com', category: 'Central Job', state: 'ALL_IN', ranking: 15 },
  { name: 'GKToday.in', domain: 'gktoday.in', category: 'Central Job', state: 'ALL_IN', ranking: 16 },
  { name: 'Prepp.in', domain: 'prepp.in', category: 'Central Job', state: 'ALL_IN', ranking: 17 },
  { name: 'OliveBoard.com', domain: 'oliveboard.in', category: 'Central Job', state: 'ALL_IN', ranking: 18 },
  { name: 'Smartkeeda.com', domain: 'smartkeeda.com', category: 'Central Job', state: 'ALL_IN', ranking: 19 },
  { name: 'Guidely.in', domain: 'guidely.in', category: 'Central Job', state: 'ALL_IN', ranking: 20 },
  { name: 'ExamPundit.com', domain: 'exampundit.in', category: 'Central Job', state: 'ALL_IN', ranking: 21 },
  { name: 'MahendraGuru.com', domain: 'mahendraguru.com', category: 'Central Job', state: 'ALL_IN', ranking: 22 },
  { name: 'StudyIQ.com', domain: 'studyiq.com', category: 'Central Job', state: 'ALL_IN', ranking: 23 },
  { name: 'Wifistudy.com', domain: 'wifistudy.com', category: 'Central Job', state: 'ALL_IN', ranking: 24 },
  { name: 'Unacademy.com', domain: 'unacademy.com', category: 'Central Job', state: 'ALL_IN', ranking: 25 },

  // === STATE COMPETITORS (top 25 major states) ===
  // Maharashtra
  { name: 'MpscOnline.com', domain: 'mpsonline.gov.in', officialDomain: 'mpsc.gov.in', category: 'State Job', state: 'Maharashtra', ranking: 1 },
  { name: 'MahaJobs.net', domain: 'mahajobnet.com', category: 'State Job', state: 'Maharashtra', ranking: 2 },
  { name: 'NaukriMITra.com', domain: 'naukrimitra.com', category: 'State Job', state: 'Maharashtra', ranking: 3 },
  { name: 'MHGovtJobs.com', domain: 'mhgovtjobs.com', category: 'State Job', state: 'Maharashtra', ranking: 4 },

  // Uttar Pradesh
  { name: 'Upsssc.gov.in (Competitor)', domain: 'upssscguru.com', category: 'State Job', state: 'Uttar Pradesh', ranking: 1 },
  { name: 'UPJobPortal.com', domain: 'upjobportal.com', category: 'State Job', state: 'Uttar Pradesh', ranking: 2 },
  { name: 'SarkariUjala.com', domain: 'sarkariujala.com', category: 'State Job', state: 'Uttar Pradesh', ranking: 3 },

  // Bihar
  { name: 'BPSCUpdate.com', domain: 'bpscupdate.com', category: 'State Job', state: 'Bihar', ranking: 1 },
  { name: 'BiharJob.in', domain: 'biharjob.in', category: 'State Job', state: 'Bihar', ranking: 2 },
  { name: 'SarkariResultBihar.com', domain: 'sarkariresultbihar.com', category: 'State Job', state: 'Bihar', ranking: 3 },

  // Rajasthan
  { name: 'RPSCPortal.com', domain: 'rpscportal.com', category: 'State Job', state: 'Rajasthan', ranking: 1 },
  { name: 'RajJobs.in', domain: 'rajjobs.in', category: 'State Job', state: 'Rajasthan', ranking: 2 },

  // Madhya Pradesh
  { name: 'MPOnlineJobs.com', domain: 'mponlinejobs.com', category: 'State Job', state: 'Madhya Pradesh', ranking: 1 },
  { name: 'MPEBUpdate.com', domain: 'mpebupdate.com', category: 'State Job', state: 'Madhya Pradesh', ranking: 2 },

  // Gujarat
  { name: 'GPSCExam.com', domain: 'gpscexam.com', category: 'State Job', state: 'Gujarat', ranking: 1 },
  { name: 'GujaratJobs.in', domain: 'gujaratjobs.in', category: 'State Job', state: 'Gujarat', ranking: 2 },

  // Tamil Nadu
  { name: 'TNpscGUIDE.com', domain: 'tnpscguide.com', category: 'State Job', state: 'Tamil Nadu', ranking: 1 },
  { name: 'TNSpider.com', domain: 'tnspider.com', category: 'State Job', state: 'Tamil Nadu', ranking: 2 },

  // Karnataka
  { name: 'KPSCNotification.com', domain: 'kpscnotification.com', category: 'State Job', state: 'Karnataka', ranking: 1 },
  { name: 'KarnatakaJobs.in', domain: 'karnatakajobs.in', category: 'State Job', state: 'Karnataka', ranking: 2 },

  // West Bengal
  { name: 'WBPSCGuide.com', domain: 'wbpscguide.com', category: 'State Job', state: 'West Bengal', ranking: 1 },
  { name: 'WBJobsPortal.com', domain: 'wbjobsportal.com', category: 'State Job', state: 'West Bengal', ranking: 2 },

  // Odisha
  { name: 'OPSCPortal.com', domain: 'opscportal.com', category: 'State Job', state: 'Odisha', ranking: 1 },
  { name: 'OdishaJobs.in', domain: 'odishajobs.in', category: 'State Job', state: 'Odisha', ranking: 2 },

  // Telangana
  { name: 'TSPSCGuide.com', domain: 'tspscguide.com', category: 'State Job', state: 'Telangana', ranking: 1 },
  { name: 'TelanganaJobs.in', domain: 'telanganajobs.in', category: 'State Job', state: 'Telangana', ranking: 2 },

  // Andhra Pradesh
  { name: 'APPSCPortal.com', domain: 'appsceportal.com', category: 'State Job', state: 'Andhra Pradesh', ranking: 1 },
  { name: 'APJobs.in', domain: 'apjobs.in', category: 'State Job', state: 'Andhra Pradesh', ranking: 2 },

  // Kerala
  { name: 'KeralaPSCGuide.com', domain: 'keralapscguide.com', category: 'State Job', state: 'Kerala', ranking: 1 },
  { name: 'KeralaJobs.in', domain: 'keralajobs.in', category: 'State Job', state: 'Kerala', ranking: 2 },

  // Punjab
  { name: 'PPSCPortal.com', domain: 'ppscportal.com', category: 'State Job', state: 'Punjab', ranking: 1 },
  { name: 'PunjabJobs.in', domain: 'punjabjobs.in', category: 'State Job', state: 'Punjab', ranking: 2 },

  // Haryana
  { name: 'HPSCPortal.com', domain: 'hpscportal.com', category: 'State Job', state: 'Haryana', ranking: 1 },
  { name: 'HaryanaJobs.in', domain: 'haryanajobs.in', category: 'State Job', state: 'Haryana', ranking: 2 },

  // Jharkhand
  { name: 'JPSCGuide.com', domain: 'jpscguide.com', category: 'State Job', state: 'Jharkhand', ranking: 1 },
  { name: 'JharkhandJobs.in', domain: 'jharkhandjobs.in', category: 'State Job', state: 'Jharkhand', ranking: 2 },

  // Chhattisgarh
  { name: 'CGPSCPortal.com', domain: 'cgpscportal.com', category: 'State Job', state: 'Chhattisgarh', ranking: 1 },
  { name: 'CGJobs.in', domain: 'cgjobs.in', category: 'State Job', state: 'Chhattisgarh', ranking: 2 },

  // Assam
  { name: 'AssamJob.in', domain: 'assamjobs.in', category: 'State Job', state: 'Assam', ranking: 1 },

  // Goa
  { name: 'GoaJobs.in', domain: 'goajobs.in', category: 'State Job', state: 'Goa', ranking: 1 },

  // Uttarakhand
  { name: 'UKPSCGuide.com', domain: 'ukpscguide.com', category: 'State Job', state: 'Uttarakhand', ranking: 1 },

  // Himachal Pradesh
  { name: 'HPPSCPortal.com', domain: 'hpscportal.com', category: 'State Job', state: 'Himachal Pradesh', ranking: 1 },

  // Jammu & Kashmir
  { name: 'JKJobs.in', domain: 'jkjobs.in', category: 'State Job', state: 'Jammu & Kashmir', ranking: 1 },

  // Manipur
  { name: 'ManipurJobs.in', domain: 'manipurjobs.in', category: 'State Job', state: 'Manipur', ranking: 1 },

  // Mizoram
  { name: 'MizoramJobs.in', domain: 'mizoramjobs.in', category: 'State Job', state: 'Mizoram', ranking: 1 },

  // Nagaland
  { name: 'NagalandJobs.in', domain: 'nagalandjobs.in', category: 'State Job', state: 'Nagaland', ranking: 1 },

  // Tripura
  { name: 'TripuraJobs.in', domain: 'tripurajobs.in', category: 'State Job', state: 'Tripura', ranking: 1 },

  // Meghalaya
  { name: 'MeghalayaJobs.in', domain: 'meghalayajobs.in', category: 'State Job', state: 'Meghalaya', ranking: 1 },

  // Arunachal Pradesh
  { name: 'APJobsAP.in', domain: 'apjobsap.in', category: 'State Job', state: 'Arunachal Pradesh', ranking: 1 },

  // Sikkim
  { name: 'SikkimJobs.in', domain: 'sikkimjobs.in', category: 'State Job', state: 'Sikkim', ranking: 1 },
];

(async () => {
  try {
    let created = 0;
    let skipped = 0;
    for (const c of competitors) {
      try {
        await p.competitor.upsert({
          where: { domain: c.domain },
          create: c,
          update: { name: c.name },
        });
        created++;
      } catch (e) {
        skipped++;
        console.log(`Skip ${c.domain}: ${e.message}`);
      }
    }
    const total = await p.competitor.count();
    console.log(`\nDone: ${created} created, ${skipped} skipped, ${total} total competitors`);
  } catch (e) {
    console.error(e.message);
  } finally {
    await p.$disconnect();
  }
})();
