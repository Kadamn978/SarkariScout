import { chromium, type Page, type Browser } from '@playwright/test';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';

interface Bug {
  page: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  fix?: string;
}

const bugs: Bug[] = [];
function report(pageName: string, severity: Bug['severity'], description: string, fix?: string) {
  bugs.push({ page: pageName, severity, description, fix });
  console.log(`  [${severity}] ${description}`);
}

let browser: Browser;
let page: Page;

async function testPage(pageName: string, url: string, checks: (p: Page) => Promise<void>) {
  console.log(`\n=== ${pageName} (${url}) ===`);
  try {
    await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000); // let React render
    await checks(page);
  } catch (e: any) {
    report(pageName, 'CRITICAL', `Page failed to load: ${e.message.substring(0, 100)}`);
  }
}

async function collectErrors(p: Page): Promise<string[]> {
  const errors: string[] = [];
  p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  p.on('pageerror', err => errors.push(err.message));
  return errors;
}

async function run() {
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  page = await ctx.newPage();

  // ===== LANDING =====
  await testPage('Landing', '/', async p => {
    const errs = await collectErrors(p);
    const h1 = await p.$('h1');
    if (!h1) report('Landing', 'HIGH', 'No h1 heading');
    const nav = await p.$('nav');
    if (!nav) report('Landing', 'HIGH', 'No nav element');
    const footer = await p.$('footer');
    if (!footer) report('Landing', 'MEDIUM', 'No footer element');
    // Check for JS errors
    await p.waitForTimeout(1000);
    for (const e of errs) if (e.includes('TypeError') || e.includes('ReferenceError')) 
      report('Landing', 'HIGH', `JS Error: ${e.substring(0, 120)}`);
  });

  // ===== JOBS =====
  await testPage('Jobs', '/jobs', async p => {
    const errs = await collectErrors(p);
    await p.waitForTimeout(3000);
    const cards = await p.$$('article, [class*="rounded"][class*="border"]');
    if (cards.length === 0) report('Jobs', 'HIGH', 'No job cards rendered');
    const search = await p.$('input');
    if (!search) report('Jobs', 'MEDIUM', 'No search input');
    for (const e of errs) if (e.includes('TypeError') || e.includes('not iterable'))
      report('Jobs', 'HIGH', `JS Error: ${e.substring(0, 120)}`);
  });

  // ===== LOGIN =====
  await testPage('Login', '/login', async p => {
    const email = await p.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    if (!email) report('Login', 'CRITICAL', 'No email input');
    const pass = await p.$('input[type="password"]');
    if (!pass) report('Login', 'CRITICAL', 'No password input');
    const btn = await p.$('button[type="submit"], button:has-text("Log"), button:has-text("Sign")');
    if (!btn) report('Login', 'HIGH', 'No submit button');
  });

  // ===== REGISTER =====
  await testPage('Register', '/register', async p => {
    const inputs = await p.$$('input');
    const inputTypes = [];
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      inputTypes.push({ type, name, placeholder });
    }
    console.log(`  Found ${inputs.length} inputs:`, JSON.stringify(inputTypes));
    
    const nameInput = await p.$('input[name="name"], input[placeholder*="name" i], input[type="text"]');
    if (!nameInput) report('Register', 'CRITICAL', 'No name/text input found');
    const email = await p.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    if (!email) report('Register', 'CRITICAL', 'No email input');
    const pass = await p.$('input[type="password"]');
    if (!pass) report('Register', 'CRITICAL', 'No password input');
    const checkbox = await p.$('input[type="checkbox"]');
    if (!checkbox) report('Register', 'HIGH', 'No T&C checkbox');
  });

  // ===== MOCK TESTS =====
  await testPage('Mock Tests', '/mock-tests', async p => {
    const errs = await collectErrors(p);
    await p.waitForTimeout(3000);
    const content = await p.textContent('body');
    if (content?.includes('not iterable')) report('MockTests', 'CRITICAL', '"jobs is not iterable" error on page');
    for (const e of errs) if (e.includes('not iterable'))
      report('MockTests', 'CRITICAL', `JS Error: ${e.substring(0, 120)}`);
  });

  // ===== PAPERS =====
  await testPage('Papers', '/papers', async p => {
    const errs = await collectErrors(p);
    await p.waitForTimeout(3000);
    for (const e of errs) if (e.includes('TypeError') || e.includes('not iterable'))
      report('Papers', 'HIGH', `JS Error: ${e.substring(0, 120)}`);
  });

  // ===== EXAM CALENDAR =====
  await testPage('Exam Calendar', '/exam-calendar', async p => {
    const errs = await collectErrors(p);
    await p.waitForTimeout(3000);
    for (const e of errs) if (e.includes('TypeError') || e.includes('not iterable'))
      report('ExamCalendar', 'CRITICAL', `JS Error: ${e.substring(0, 120)}`);
  });

  // ===== RESULTS =====
  await testPage('Results', '/results', async p => {
    const errs = await collectErrors(p);
    await p.waitForTimeout(2000);
    for (const e of errs) if (e.includes('TypeError'))
      report('Results', 'HIGH', `JS Error: ${e.substring(0, 120)}`);
  });

  // ===== FAQ =====
  await testPage('FAQ', '/faq', async p => {
    await p.waitForTimeout(1000);
    const buttons = await p.$$('button');
    if (buttons.length < 5) report('FAQ', 'MEDIUM', `Only ${buttons.length} buttons, expected 12+ FAQ items`);
    // Test toggle
    if (buttons.length > 0) {
      await buttons[0].click();
      await p.waitForTimeout(500);
    }
  });

  // ===== ABOUT =====
  await testPage('About', '/about', async p => {
    const content = await p.textContent('body');
    if (content?.includes('20+ Sources') || content?.includes('22 Mock Tests'))
      report('About', 'HIGH', 'Contains fake hardcoded stats');
  });

  // ===== TERMS =====
  await testPage('Terms', '/terms', async p => {
    const content = await p.textContent('body');
    if (!content || content.replace(/\s/g, '').length < 200)
      report('Terms', 'HIGH', 'Terms page content too short');
  });

  // ===== PRIVACY =====
  await testPage('Privacy', '/privacy', async p => {
    const content = await p.textContent('body');
    if (!content || content.replace(/\s/g, '').length < 200)
      report('Privacy', 'HIGH', 'Privacy page content too short');
  });

  // ===== CONTACT =====
  await testPage('Contact', '/contact', async p => {
    const form = await p.$('form');
    if (!form) report('Contact', 'HIGH', 'No contact form');
    const inputs = await p.$$('input, textarea');
    if (inputs.length < 2) report('Contact', 'MEDIUM', `Only ${inputs.length} form fields`);
  });

  // ===== 404 =====
  await testPage('404', '/nonexistent-page-xyz', async p => {
    const content = await p.textContent('body');
    if (!content?.match(/404|not found|Not Found/i))
      report('404', 'MEDIUM', 'No 404 message displayed');
  });

  // ===== MOBILE VIEWPORT =====
  console.log('\n=== Mobile (375x667) ===');
  await page.setViewportSize({ width: 375, height: 667 });
  await testPage('Landing Mobile', '/', async p => {
    const hamburger = await p.$('button[aria-label*="menu" i], [class*="hamburger"], [class*="menu-button"]');
    if (!hamburger) report('Landing Mobile', 'MEDIUM', 'No mobile hamburger menu');
  });

  // ===== API CHECK =====
  console.log('\n=== API Health ===');
  try {
    const res = await page.evaluate(async () => {
      const r = await fetch('http://localhost:3000/api/health');
      return { status: r.status, body: await r.json() };
    });
    console.log(`  Status: ${res.status}, DB: ${res.body.database}, Redis: ${res.body.redis}`);
  } catch (e: any) {
    report('API', 'CRITICAL', `API unreachable: ${e.message.substring(0, 80)}`);
  }

  // ===== SUMMARY =====
  console.log('\n\n========================================');
  console.log('         BUG REPORT');
  console.log('========================================\n');
  
  const by = (s: string) => bugs.filter(b => b.severity === s);
  console.log(`CRITICAL: ${by('CRITICAL').length}`);
  console.log(`HIGH:     ${by('HIGH').length}`);
  console.log(`MEDIUM:   ${by('MEDIUM').length}`);
  console.log(`TOTAL:    ${bugs.length}\n`);
  
  bugs.forEach((b, i) => {
    console.log(`${i+1}. [${b.severity}] ${b.page}: ${b.description}`);
  });

  await browser.close();
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
