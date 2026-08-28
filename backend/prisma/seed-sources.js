"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding government sources with social channels...');
    const sources = [
        {
            id: 'ssc',
            name: 'Staff Selection Commission (SSC)',
            type: 'RSS',
            baseUrl: 'https://ssc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://ssc.gov.in',
                officialDomains: ['ssc.gov.in'],
                rssUrl: 'https://ssc.gov.in/portal/Portal3/NoticeBoard.aspx',
                postJobHours: [10, 11, 12, 13, 14],
                exams: ['CGL', 'CHSL', 'MTS', 'JE', 'Steno', 'GD Constable', 'Selection Post'],
                social: {
                    youtube: 'https://youtube.com/@StaffSelectionCommission',
                    twitter: 'https://x.com/SSC_GoI',
                    telegram: null,
                },
            }),
        },
        {
            id: 'upsc',
            name: 'Union Public Service Commission (UPSC)',
            type: 'RSS',
            baseUrl: 'https://upsc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://upsc.gov.in',
                officialDomains: ['upsc.gov.in', 'upsconline.nic.in'],
                rssUrl: 'https://upsc.gov.in/examination-notifications',
                postJobHours: [10, 11, 12, 13, 14],
                exams: ['Civil Services', 'CDS', 'NDA', 'IES/ISS', 'CMS', 'CPF', 'Engineering Services'],
                social: {
                    youtube: 'https://youtube.com/@UPSCOfficial',
                    twitter: null,
                    linkedin: 'https://linkedin.com/company/official-union-public-service-commission',
                    telegram: null,
                },
            }),
        },
        {
            id: 'ibps',
            name: 'Institute of Banking Personnel Selection (IBPS)',
            type: 'HTML',
            baseUrl: 'https://ibps.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://ibps.in',
                officialDomains: ['ibps.in'],
                postJobHours: [10, 11, 12, 13, 14],
                exams: ['PO', 'Clerk', 'SO', 'RRB PO', 'RRB Clerk'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/ibps_official',
                    telegram: null,
                },
            }),
        },
        {
            id: 'rrb',
            name: 'Railway Recruitment Boards (RRB)',
            type: 'HTML',
            baseUrl: 'https://rrbapply.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://rrbapply.gov.in',
                officialDomains: ['rrbapply.gov.in', 'rrb.gov.in'],
                postJobHours: [10, 11, 12, 13, 14],
                exams: ['NTPC', 'Group D', 'ALP', 'JE', 'Technician'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/RailwayMinIndia',
                    telegram: null,
                },
            }),
        },
        {
            id: 'india-post',
            name: 'India Post (Department of Posts)',
            type: 'HTML',
            baseUrl: 'https://indiapostgdsonline.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://indiapostgdsonline.gov.in',
                exams: ['GDS', 'MTS', 'Postman', 'Mail Guard'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/ABORGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'indian-army',
            name: 'Indian Army',
            type: 'HTML',
            baseUrl: 'https://joinindianarmy.nic.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://joinindianarmy.nic.in',
                exams: ['NDA', 'CDS', 'TGC', 'SSC Tech', 'Agniveer'],
                social: {
                    youtube: 'https://youtube.com/@ABORGOES',
                    twitter: 'https://x.com/indianaborGOES',
                    instagram: 'https://instagram.com/indianarmy',
                    facebook: 'https://facebook.com/indianarmy',
                },
            }),
        },
        {
            id: 'indian-navy',
            name: 'Indian Navy',
            type: 'HTML',
            baseUrl: 'https://joinindiannavy.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://joinindiannavy.gov.in',
                exams: ['NDA', 'CDS', 'SSR', 'MR', 'Agniveer'],
                social: {
                    youtube: 'https://youtube.com/@indiannavy',
                    twitter: 'https://x.com/indiannavy',
                    instagram: 'https://instagram.com/indiannavy',
                    facebook: 'https://facebook.com/indiannavy',
                },
            }),
        },
        {
            id: 'indian-air-force',
            name: 'Indian Air Force',
            type: 'HTML',
            baseUrl: 'https://afcat.cdac.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://afcat.cdac.in',
                exams: ['AFCAT', 'NDA', 'CDS', 'Agniveer Vayu'],
                social: {
                    youtube: 'https://youtube.com/@indianairforce',
                    twitter: 'https://x.com/IAF_MCC',
                    instagram: 'https://instagram.com/indianairforce',
                    facebook: 'https://facebook.com/indianairforce',
                },
            }),
        },
        {
            id: 'drdo',
            name: 'Defence Research and Development Organisation (DRDO)',
            type: 'HTML',
            baseUrl: 'https://drdo.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://drdo.gov.in',
                exams: ['Scientist B', 'Apprentice', 'Technician'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/DRDO_India',
                    telegram: null,
                },
            }),
        },
        {
            id: 'isro',
            name: 'Indian Space Research Organisation (ISRO)',
            type: 'HTML',
            baseUrl: 'https://isro.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://isro.gov.in',
                exams: ['Scientist/Engineer', 'Apprentice'],
                social: {
                    youtube: 'https://youtube.com/@isrodotgov',
                    twitter: 'https://x.com/isaborgs',
                    telegram: null,
                },
            }),
        },
        {
            id: 'sbi',
            name: 'State Bank of India (SBI)',
            type: 'HTML',
            baseUrl: 'https://sbi.co.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://sbi.co.in',
                exams: ['PO', 'Clerk', 'SO', 'Apprentice'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/ABORGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'rbi',
            name: 'Reserve Bank of India (RBI)',
            type: 'HTML',
            baseUrl: 'https://rbi.org.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://rbi.org.in',
                exams: ['Grade B', 'Assistant', 'DEPR', 'DSIM'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/ABORGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'uppsc',
            name: 'Uttar Pradesh Public Service Commission (UPPSC)',
            type: 'HTML',
            baseUrl: 'https://uppsc.up.nic.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://uppsc.up.nic.in',
                exams: ['PCS', 'APO', 'RO/ARO', 'Lecturer', 'Specialist'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'upsssc',
            name: 'Uttar Pradesh Subordinate Services Selection Commission (UPSSSC)',
            type: 'HTML',
            baseUrl: 'https://upsssc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://upsssc.gov.in',
                exams: ['PET', 'Junior Assistant', 'LDA', 'Pharmacist', 'Lab Technician'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'bpsc',
            name: 'Bihar Public Service Commission (BPSC)',
            type: 'HTML',
            baseUrl: 'https://bpsc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://bpsc.gov.in',
                exams: ['68th-72nd CCE', 'TRE 4.0', 'Auditor', 'Assistant'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'mpsc',
            name: 'Maharashtra Public Service Commission (MPSC)',
            type: 'HTML',
            baseUrl: 'https://mpsc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://mpsc.gov.in',
                exams: ['State Service', 'PSI', 'STI', 'ASO', 'Engineering'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'rpsc',
            name: 'Rajasthan Public Service Commission (RPSC)',
            type: 'HTML',
            baseUrl: 'https://rpsc.rajasthan.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://rpsc.rajasthan.gov.in',
                exams: ['RAS', '2nd Grade Teacher', 'SI', 'School Lecturer'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'mppsc',
            name: 'Madhya Pradesh Public Service Commission (MPPSC)',
            type: 'HTML',
            baseUrl: 'https://mppsc.mp.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://mppsc.mp.gov.in',
                exams: ['State Service', 'Medical Officer', 'Assistant Professor'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'dsssb',
            name: 'Delhi Subordinate Services Selection Board (DSSSB)',
            type: 'HTML',
            baseUrl: 'https://dsssb.delhi.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://dsssb.delhi.gov.in',
                exams: ['TGT', 'PGT', 'LDC', 'DEO', 'Patwari'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'hssc',
            name: 'Haryana Staff Selection Commission (HSSC)',
            type: 'HTML',
            baseUrl: 'https://hssc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://hssc.gov.in',
                exams: ['Group C', 'Group D', 'Constable', 'Clerk'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'kerala-psc',
            name: 'Kerala Public Service Commission (KPSC)',
            type: 'HTML',
            baseUrl: 'https://keralapsc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://keralapsc.gov.in',
                exams: ['10th Level', '12th Level', 'Degree Level'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'tnpsc',
            name: 'Tamil Nadu Public Service Commission (TNPSC)',
            type: 'HTML',
            baseUrl: 'https://tnpsc.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://tnpsc.gov.in',
                exams: ['Group 1', 'Group 2', 'Group 4', 'VAO'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'karnataka-psc',
            name: 'Karnataka Public Service Commission (KPSC)',
            type: 'HTML',
            baseUrl: 'https://kpsc.kar.nic.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://kpsc.kar.nic.in',
                exams: ['FDA', 'SDA', 'Assistant Engineer', 'Deputy Superintendent'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'gujarat-psc',
            name: 'Gujarat Public Service Commission (GPSC)',
            type: 'HTML',
            baseUrl: 'https://gpsc.gujarat.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://gpsc.gujarat.gov.in',
                exams: ['Class 1-2', 'DySP', 'Mamlatdar', 'Engineer'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'cbse',
            name: 'Central Board of Secondary Education (CBSE)',
            type: 'HTML',
            baseUrl: 'https://cbse.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://cbse.gov.in',
                exams: ['CTET', 'TGT', 'PGT'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/CBSEaborGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'kvs',
            name: 'Kendriya Vidyalaya Sangathan (KVS)',
            type: 'HTML',
            baseUrl: 'https://kvsangathan.nic.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://kvsangathan.nic.in',
                exams: ['PGT', 'TGT', 'PRT', 'Librarian', 'Nurse'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/KVSaborGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'nvs',
            name: 'Navodaya Vidyalaya Samiti (NVS)',
            type: 'HTML',
            baseUrl: 'https://navodaya.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://navodaya.gov.in',
                exams: ['PGT', 'TGT', 'PRT', 'Staff Nurse'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/NavodayaVidya',
                    telegram: null,
                },
            }),
        },
        {
            id: 'icmr',
            name: 'Indian Council of Medical Research (ICMR)',
            type: 'HTML',
            baseUrl: 'https://icmr.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://icmr.gov.in',
                exams: ['Scientist B', 'Technical Assistant'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/ICMRaborGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'nic',
            name: 'National Informatics Centre (NIC)',
            type: 'HTML',
            baseUrl: 'https://nic.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://nic.in',
                exams: ['Scientist B', 'Scientific/Technical Assistant'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/_ABORGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'fci',
            name: 'Food Corporation of India (FCI)',
            type: 'HTML',
            baseUrl: 'https://fci.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://fci.gov.in',
                exams: ['Manager', 'Assistant Grade', 'Watchman'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/FCIaborGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'nhai',
            name: 'National Highways Authority of India (NHAI)',
            type: 'HTML',
            baseUrl: 'https://nhai.gov.in',
            schedule: '0 */12 * * *',
            configJson: JSON.stringify({
                website: 'https://nhai.gov.in',
                exams: ['Deputy Manager', 'Manager'],
                social: {
                    youtube: null,
                    twitter: 'https://x.com/ABORGOES',
                    telegram: null,
                },
            }),
        },
        {
            id: 'rssb',
            name: 'Rajasthan Staff Selection Board (RSSB)',
            type: 'HTML',
            baseUrl: 'https://rssb.rajasthan.gov.in',
            schedule: '0 */6 * * *',
            configJson: JSON.stringify({
                website: 'https://rssb.rajasthan.gov.in',
                exams: ['2nd Grade Teacher', 'Junior Engineer', 'Lab Assistant'],
                social: {
                    youtube: null,
                    twitter: null,
                    telegram: null,
                },
            }),
        },
        {
            id: 'competitor-sarkariresult',
            name: 'SarkariResult.com (Competitor)',
            type: 'HTML',
            baseUrl: 'https://www.sarkariresult.com',
            schedule: '0 0 * * *',
            configJson: JSON.stringify({
                isCompetitor: true,
                monthlyVisitors: '50M+',
                founded: 2012,
                social: {
                    youtube: '250K+ subscribers',
                    telegram: '1.5M+ members',
                    whatsapp: '6.3M+ members',
                    instagram: '640K+ followers',
                    facebook: '861K+ likes',
                    twitter: '15K+ followers',
                    threads: '67K+ followers',
                },
                features: ['One-page job summaries', 'Mobile apps (Android+iOS)', 'Trademarked brand'],
            }),
        },
        {
            id: 'competitor-freejobalert',
            name: 'FreeJobAlert.com (Competitor)',
            type: 'HTML',
            baseUrl: 'https://www.freejobalert.com',
            schedule: '0 0 * * *',
            configJson: JSON.stringify({
                isCompetitor: true,
                monthlyVisitors: '10M+',
                founded: 2011,
                social: {
                    whatsapp: '2.5L+ members',
                },
                features: ['State-wise filtering', 'Education-based filtering', 'Mock tests', 'PDF tools', 'Image resizer'],
            }),
        },
    ];
    for (const s of sources) {
        await prisma.source.upsert({
            where: { id: s.id },
            update: { configJson: s.configJson },
            create: s,
        });
    }
    console.log(`✅ ${sources.length} government sources seeded (including 2 competitors)`);
}
main()
    .catch((e) => {
    console.error('❌ Source seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
