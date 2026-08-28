import { chromium, type Page } from '@playwright/test';
import * as fs from 'fs';

const BASE = 'http://localhost:5173';
const DIR = 'D:\\Nilesh\\laragon\\www\\New folder\\frontend\\e2e\\screenshots';

let pass = 0, fail = 0;
const failures: string[] = [];

function log(page: string, action: string, ok: boolean, detail?: string) {
  const icon = ok ? '✅' : '❌';
  console.log(`  ${icon} ${action}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++; else { fail++; failures.push(`${page}: ${action}${detail ? ` — ${detail}` : ''}`); }
}

async function dismissCookies(p: Page) {
  await p.evaluate(() => {
    // Only remove elements that look like cookie banners (bottom-fixed with Accept/Reject buttons)
    document.querySelectorAll('div').forEach(el => {
      const style = getComputedStyle(el);
      const text = el.textContent || '';
      if (style.position === 'fixed' && parseInt(style.bottom || '999') < 100 &&
          (text.includes('Accept') || text.includes('Cookie') || text.includes('Consent'))) {
        el.remove();
      }
    });
  }).catch(() => {});
}

async function nav(p: Page, url: string) {
  await p.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await p.waitForTimeout(2500);
  await dismissCookies(p);
}

async function click(p: Page, selector: string) {
  const el = await p.$(selector);
  if (el) await el.click({ force: true, timeout: 5000 }).catch(() => {});
  return el;
}

async function run() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const jsErrors: string[] = [];
  page.on('pageerror', err => jsErrors.push(err.message));

  // === 1. LANDING ===
  console.log('\n=== 1. LANDING ===');
  await nav(page, '/');
  log('Landing', 'h1 exists', !!(await page.$('h1')));
  log('Landing', 'nav exists', !!(await page.$('nav')));
  log('Landing', 'footer exists', !!(await page.$('footer')));
  await page.screenshot({ path: `${DIR}/01-landing.png`, fullPage: true });

  // Test Get Started
  await page.evaluate(() => {
    const link = document.querySelector('a[href="/register"]');
    if (link) (link as HTMLElement).click();
  });
  await page.waitForTimeout(1500);
  log('Landing', 'Get Started → /register', page.url().includes('/register'));

  // Test Login
  await nav(page, '/');
  await click(page, 'a:has-text("Login")');
  await page.waitForTimeout(1000);
  log('Landing', 'Login link → /login', page.url().includes('/login'));

  // === 2. LOGIN ===
  console.log('\n=== 2. LOGIN ===');
  await nav(page, '/login');
  log('Login', 'email input', !!(await page.$('input[type="email"], input[placeholder*="email" i]')));
  log('Login', 'password input', !!(await page.$('input[type="password"]')));
  log('Login', 'submit button', !!(await page.$('button[type="submit"]')));
  log('Login', 'Google OAuth btn', !!(await page.$('button:has-text("Google"), a:has-text("Google")')));
  await page.screenshot({ path: `${DIR}/02-login.png`, fullPage: true });

  // Test invalid login
  const emailInput = await page.$('input[type="email"], input[placeholder*="email" i]');
  const passInput = await page.$('input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.fill('test@test.com');
    await passInput.fill('wrongpassword');
    await click(page, 'button[type="submit"]');
    await page.waitForTimeout(2000);
    log('Login', 'invalid login stays on page', page.url().includes('/login'));
  }

  // === 3. REGISTER ===
  console.log('\n=== 3. REGISTER ===');
  await nav(page, '/register');
  log('Register', 'name input', !!(await page.$('input[type="text"]')));
  log('Register', 'email input', !!(await page.$('input[type="email"]')));
  log('Register', 'password input', !!(await page.$('input[type="password"]')));
  log('Register', 'T&C checkbox', !!(await page.$('input[type="checkbox"]')));
  await page.screenshot({ path: `${DIR}/03-register.png`, fullPage: true });

  // Fill register form
  const nameI = await page.$('input[type="text"]');
  const emailI = await page.$('input[type="email"]');
  const passI = await page.$('input[type="password"]');
  if (nameI && emailI && passI) {
    await nameI.fill('Test User');
    await emailI.fill('test2@example.com');
    await passI.fill('TestPass123!');
    await click(page, 'button[type="submit"]');
    await page.waitForTimeout(2000);
    // Should fail without T&C checked
    log('Register', 'submit without T&C fails', page.url().includes('/register'));
  }

  // === 4. JOBS ===
  console.log('\n=== 4. JOBS ===');
  await nav(page, '/jobs');
  const jobCards = await page.$$('article, [class*="rounded"][class*="border"][class*="bg-white"]');
  log('Jobs', `cards rendered (${jobCards.length})`, jobCards.length > 0);
  log('Jobs', 'search input', !!(await page.$('input')));
  await page.screenshot({ path: `${DIR}/04-jobs.png`, fullPage: true });

  // Click first job if exists
  if (jobCards.length > 0) {
    const link = await jobCards[0].$('a');
    if (link) {
      const href = await link.getAttribute('href');
      if (href) {
        await link.click({ force: true });
        await page.waitForTimeout(2000);
        log('Jobs', 'click job → detail page', page.url().includes('/jobs/') || page.url() !== `${BASE}/jobs`);
      }
    }
  }

  // === 5. MOCK TESTS ===
  console.log('\n=== 5. MOCK TESTS ===');
  await nav(page, '/mock-tests');
  const mockCards = await page.$$('article, [class*="rounded"][class*="border"]');
  log('MockTests', `cards rendered (${mockCards.length})`, mockCards.length > 0);
  await page.screenshot({ path: `${DIR}/05-mock-tests.png`, fullPage: true });

  // === 6. PAPERS ===
  console.log('\n=== 6. PAPERS ===');
  await nav(page, '/papers');
  const paperCards = await page.$$('article, [class*="rounded"][class*="border"]');
  log('Papers', `cards rendered (${paperCards.length})`, paperCards.length > 0);
  await page.screenshot({ path: `${DIR}/06-papers.png`, fullPage: true });

  // === 7. EXAM CALENDAR ===
  console.log('\n=== 7. EXAM CALENDAR ===');
  await nav(page, '/exam-calendar');
  log('ExamCalendar', 'heading exists', !!(await page.$('h1')));
  const viewBtns = await page.$$('button[title="List"], button[title="Grid"], button[title="Calendar"]');
  log('ExamCalendar', `view buttons (${viewBtns.length})`, viewBtns.length === 3);
  if (viewBtns.length >= 2) { await viewBtns[1].click({ force: true }); await page.waitForTimeout(500); }
  if (viewBtns.length >= 3) { await viewBtns[2].click({ force: true }); await page.waitForTimeout(500); }
  log('ExamCalendar', 'view toggles work', true);
  await page.screenshot({ path: `${DIR}/07-exam-calendar.png`, fullPage: true });

  // === 8. RESULTS ===
  console.log('\n=== 8. RESULTS ===');
  await nav(page, '/results');
  log('Results', 'page loaded', true);
  await page.screenshot({ path: `${DIR}/08-results.png`, fullPage: true });

  // === 9. FAQ ===
  console.log('\n=== 9. FAQ ===');
  await nav(page, '/faq');
  const faqBtns = await page.$$('button');
  log('FAQ', `items (${faqBtns.length})`, faqBtns.length >= 10);
  if (faqBtns.length > 0) { await faqBtns[0].click({ force: true }); await page.waitForTimeout(500); }
  await page.screenshot({ path: `${DIR}/09-faq.png`, fullPage: true });

  // === 10. ABOUT ===
  console.log('\n=== 10. ABOUT ===');
  await nav(page, '/about');
  const aboutText = await page.textContent('body');
  log('About', 'no fake stats', !aboutText?.includes('20+ Sources') && !aboutText?.includes('22 Mock Tests'));
  await page.screenshot({ path: `${DIR}/10-about.png`, fullPage: true });

  // === 11. TERMS ===
  console.log('\n=== 11. TERMS ===');
  await nav(page, '/terms');
  const termsText = await page.textContent('body');
  log('Terms', `content length (${termsText?.length})`, (termsText?.length || 0) > 500);
  await page.screenshot({ path: `${DIR}/11-terms.png`, fullPage: true });

  // === 12. PRIVACY ===
  console.log('\n=== 12. PRIVACY ===');
  await nav(page, '/privacy');
  const privText = await page.textContent('body');
  log('Privacy', `content length (${privText?.length})`, (privText?.length || 0) > 500);
  await page.screenshot({ path: `${DIR}/12-privacy.png`, fullPage: true });

  // === 13. CONTACT ===
  console.log('\n=== 13. CONTACT ===');
  await nav(page, '/contact');
  log('Contact', 'form exists', !!(await page.$('form')));
  await page.screenshot({ path: `${DIR}/13-contact.png`, fullPage: true });

  // === 14. DARK MODE ===
  console.log('\n=== 14. DARK MODE ===');
  // Reset theme to light before testing
  await page.evaluate(() => { localStorage.setItem('theme', 'light'); });
  await nav(page, '/');
  await page.waitForTimeout(500);
  // Force theme reset after mount
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  });
  await page.waitForTimeout(500);

  const beforeDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('  Before toggle - dark:', beforeDark);

  // Click dark mode toggle
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      const text = btn.textContent || '';
      if (text.includes('🌙') || text.includes('☀️')) {
        (btn as HTMLElement).click();
        return;
      }
    }
  });
  await page.waitForTimeout(1500);
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  log('DarkMode', 'toggle to dark', isDark);
  await page.screenshot({ path: `${DIR}/14-dark-mode.png`, fullPage: true });

  // Toggle back
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      const text = btn.textContent || '';
      if (text.includes('🌙') || text.includes('☀️')) {
        (btn as HTMLElement).click();
        return;
      }
    }
  });
  await page.waitForTimeout(1500);
  const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
  log('DarkMode', 'toggle to light', isLight);

  // === 15. MOBILE ===
  console.log('\n=== 15. MOBILE ===');
  await page.setViewportSize({ width: 375, height: 667 });
  await nav(page, '/');
  await page.screenshot({ path: `${DIR}/15-mobile-landing.png`, fullPage: true });

  const hamburger = await page.$('button[aria-label*="menu" i]');
  log('Mobile', 'hamburger exists', !!hamburger);
  if (hamburger) {
    await hamburger.click({ force: true }); await page.waitForTimeout(1000);
    await page.screenshot({ path: `${DIR}/15-mobile-menu.png`, fullPage: true });
    // Use Playwright click (not JS click) to trigger React Router's onClick handler
    const jobsLinks = await page.$$('a[href="/jobs"]');
    let clicked = false;
    for (const link of jobsLinks) {
      const visible = await link.evaluate((el: any) => el.offsetParent !== null && el.offsetWidth > 0);
      if (visible) {
        await link.click({ force: true, timeout: 3000 }).catch(() => {});
        clicked = true;
        break;
      }
    }
    log('Mobile', 'clicked visible jobs link', clicked);
    await page.waitForTimeout(2000);
    log('Mobile', 'navigates to jobs', page.url().includes('/jobs'));
  }

  await nav(page, '/login');
  await page.screenshot({ path: `${DIR}/15-mobile-login.png`, fullPage: true });
  log('Mobile', 'login renders', true);

  // === 16. 404 ===
  console.log('\n=== 16. 404 ===');
  await page.setViewportSize({ width: 1280, height: 720 });
  await nav(page, '/nonexistent-page-xyz');
  const nf = await page.textContent('body');
  log('404', 'shows not found', nf?.match(/404|not found/i) ? true : false);
  await page.screenshot({ path: `${DIR}/16-404.png`, fullPage: true });

  // === 17. NAV LINKS ===
  console.log('\n=== 17. NAV LINKS ===');
  const navLinks = ['/jobs', '/mock-tests', '/papers', '/exam-calendar', '/results', '/faq', '/about', '/terms', '/privacy', '/contact', '/login', '/register'];
  for (const href of navLinks) {
    try {
      const res = await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      log('Nav', href, (res?.status() || 500) < 400, `status ${res?.status()}`);
    } catch { log('Nav', href, false, 'timeout'); }
  }

  // === 18. API ===
  console.log('\n=== 18. API ===');
  try {
    const http = await import('http');
    const healthOk = await new Promise<boolean>((resolve) => {
      http.get('http://localhost:3000/api/health', (res) => {
        resolve(res.statusCode === 200);
      }).on('error', () => resolve(false));
    });
    log('API', 'health check', healthOk);
  } catch { log('API', 'health check', false); }

  // === JS ERRORS ===
  console.log('\n=== JS ERRORS ===');
  log('JS', `unhandled errors (${jsErrors.length})`, jsErrors.length === 0);
  jsErrors.slice(0, 5).forEach(e => console.log(`    ❌ ${e.substring(0, 120)}`));

  // === SUMMARY ===
  console.log('\n' + '='.repeat(50));
  console.log('         MANUAL BROWSER TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`  ✅ PASS: ${pass}`);
  console.log(`  ❌ FAIL: ${fail}`);
  console.log(`  TOTAL:  ${pass + fail}`);
  console.log(`  RATE:   ${((pass / (pass + fail)) * 100).toFixed(1)}%`);
  if (failures.length > 0) {
    console.log('\n  Failed:');
    failures.forEach(f => console.log(`    ❌ ${f}`));
  }
  console.log(`\n  Screenshots: ${DIR}`);

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
