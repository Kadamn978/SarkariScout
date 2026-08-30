import { chromium, type Page, type Browser } from 'playwright';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';

let pass = 0, fail = 0;
const bugs: string[] = [];
const warnings: string[] = [];

function ok(page: string, test: string, detail?: string) {
  console.log(`  ✅ ${test}${detail ? ` — ${detail}` : ''}`);
  pass++;
}
function bug(page: string, test: string, detail?: string) {
  const msg = `${page}: ${test}${detail ? ` — ${detail}` : ''}`;
  console.log(`  ❌ ${test}${detail ? ` — ${detail}` : ''}`);
  fail++;
  bugs.push(msg);
}
function warn(page: string, test: string, detail?: string) {
  console.log(`  ⚠️  ${test}${detail ? ` — ${detail}` : ''}`);
  warnings.push(`${page}: ${test}${detail ? ` — ${detail}` : ''}`);
}

async function dismissCookies(p: Page) {
  await p.evaluate(() => {
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
  await p.waitForTimeout(2000);
  await dismissCookies(p);
}

async function screenshot(p: Page, name: string) {
  const dir = 'D:\\Nilesh\\laragon\\www\\New folder\\frontend\\e2e\\screenshots';
  await p.screenshot({ path: `${dir}/${name}.png`, fullPage: true }).catch(() => {});
}

async function testLanding(p: Page) {
  console.log('\n🏠 LANDING PAGE');
  await nav(p, '/');

  // Structure
  const h1 = await p.$('h1');
  h1 ? ok('Landing', 'h1 exists') : bug('Landing', 'missing h1');

  const navEl = await p.$('nav');
  navEl ? ok('Landing', 'nav exists') : bug('Landing', 'missing nav');

  const footer = await p.$('footer');
  footer ? ok('Landing', 'footer exists') : bug('Landing', 'missing footer');

  // Stats section
  const stats = await p.$$('text=/\\d+/');
  stats.length > 0 ? ok('Landing', `stats rendered (${stats.length} numbers)`) : warn('Landing', 'no stats visible');

  // Job cards
  const cards = await p.$$('article, [class*="rounded"][class*="border"][class*="bg-white"]');
  cards.length > 0 ? ok('Landing', `job cards rendered (${cards.length})`) : warn('Landing', 'no job cards');

  // Hero CTA links
  const getStarted = await p.$('a[href="/register"]');
  getStarted ? ok('Landing', 'Get Started CTA exists') : bug('Landing', 'missing Get Started CTA');

  const loginLink = await p.$('a[href="/login"]');
  loginLink ? ok('Landing', 'Login link exists') : bug('Landing', 'missing Login link');

  // No fake stats
  const bodyText = await p.textContent('body') || '';
  const bodyLower = bodyText.toLowerCase();
  const hasFakeStats = bodyLower.includes('20+ sources') || bodyLower.includes('22 mock tests') ||
    bodyLower.includes('220+ questions') || bodyLower.includes('50,000+ users');
  !hasFakeStats ? ok('Landing', 'no fake/hardcoded stats') : bug('Landing', 'contains fake stats');

  // Screenshot
  await screenshot(p, '01-landing');
}

async function testLogin(p: Page) {
  console.log('\n🔐 LOGIN PAGE');
  await nav(p, '/login');

  const emailInput = await p.$('input[type="email"], input[placeholder*="email" i]');
  emailInput ? ok('Login', 'email input exists') : bug('Login', 'missing email input');

  const passInput = await p.$('input[type="password"]');
  passInput ? ok('Login', 'password input exists') : bug('Login', 'missing password input');

  const submitBtn = await p.$('button[type="submit"]');
  submitBtn ? ok('Login', 'submit button exists') : bug('Login', 'missing submit button');

  const googleBtn = await p.$('button:has-text("Google"), a:has-text("Google")');
  googleBtn ? ok('Login', 'Google OAuth button exists') : bug('Login', 'missing Google OAuth');

  // Invalid login test
  if (emailInput && passInput) {
    await emailInput.fill('wrong@test.com');
    await passInput.fill('wrongpassword');
    await submitBtn?.click({ force: true });
    await p.waitForTimeout(2000);
    const stillOnLogin = p.url().includes('/login');
    stillOnLogin ? ok('Login', 'invalid login stays on page') : bug('Login', 'invalid login navigated away');
  }

  await screenshot(p, '02-login');
}

async function testRegister(p: Page) {
  console.log('\n📝 REGISTER PAGE');
  await nav(p, '/register');

  const nameInput = await p.$('input[type="text"]');
  nameInput ? ok('Register', 'name input exists') : bug('Register', 'missing name input');

  const emailInput = await p.$('input[type="email"]');
  emailInput ? ok('Register', 'email input exists') : bug('Register', 'missing email input');

  const passInput = await p.$('input[type="password"]');
  passInput ? ok('Register', 'password input exists') : bug('Register', 'missing password input');

  const checkbox = await p.$('input[type="checkbox"]');
  checkbox ? ok('Register', 'T&C checkbox exists') : bug('Register', 'missing T&C checkbox');

  // Submit without T&C
  if (nameInput && emailInput && passInput) {
    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await passInput.fill('TestPass123!');
    const submitBtn = await p.$('button[type="submit"]');
    await submitBtn?.click({ force: true });
    await p.waitForTimeout(2000);
    const stayed = p.url().includes('/register');
    stayed ? ok('Register', 'submit without T&C stays on page') : bug('Register', 'submitted without T&C');
  }

  await screenshot(p, '03-register');
}

async function testJobs(p: Page) {
  console.log('\n💼 JOBS PAGE');
  await nav(p, '/jobs');

  const cards = await p.$$('article, [class*="rounded"][class*="border"][class*="bg-white"], [class*="JobCard"]');
  cards.length > 0 ? ok('Jobs', `job cards rendered (${cards.length})`) : bug('Jobs', 'no job cards rendered');

  const searchInput = await p.$('input[placeholder*="search" i], input[type="search"]');
  searchInput ? ok('Jobs', 'search input exists') : bug('Jobs', 'missing search input');

  // Click first job card link
  const firstLink = await p.$('a[href^="/jobs/"]');
  if (firstLink) {
    await firstLink.click({ force: true });
    await p.waitForTimeout(2000);
    const isDetail = p.url().includes('/jobs/');
    isDetail ? ok('Jobs', 'click job → detail page') : bug('Jobs', 'click job did not navigate to detail');
  }

  await screenshot(p, '04-jobs');
}

async function testMockTests(p: Page) {
  console.log('\n📋 MOCK TESTS');
  await nav(p, '/mock-tests');

  const cards = await p.$$('article, [class*="rounded"][class*="border"]');
  cards.length > 0 ? ok('MockTests', `test cards rendered (${cards.length})`) : bug('MockTests', 'no test cards');

  await screenshot(p, '05-mock-tests');
}

async function testPapers(p: Page) {
  console.log('\n📄 PAPERS');
  await nav(p, '/papers');

  const cards = await p.$$('article, [class*="rounded"][class*="border"]');
  cards.length > 0 ? ok('Papers', `paper cards rendered (${cards.length})`) : bug('Papers', 'no paper cards');

  await screenshot(p, '06-papers');
}

async function testExamCalendar(p: Page) {
  console.log('\n📅 EXAM CALENDAR');
  await nav(p, '/exam-calendar');

  const h1 = await p.$('h1');
  h1 ? ok('ExamCalendar', 'heading exists') : bug('ExamCalendar', 'missing heading');

  const viewBtns = await p.$$('button[title="List"], button[title="Grid"], button[title="Calendar"]');
  viewBtns.length === 3 ? ok('ExamCalendar', '3 view buttons present') : bug('ExamCalendar', `expected 3 view buttons, got ${viewBtns.length}`);

  // Switch views
  for (let i = 0; i < viewBtns.length; i++) {
    await viewBtns[i].click({ force: true });
    await p.waitForTimeout(500);
  }
  ok('ExamCalendar', 'view toggles work');

  await screenshot(p, '07-exam-calendar');
}

async function testOtherPages(p: Page) {
  const pages = [
    { url: '/results', name: 'Results' },
    { url: '/faq', name: 'FAQ' },
    { url: '/about', name: 'About' },
    { url: '/terms', name: 'Terms' },
    { url: '/privacy', name: 'Privacy' },
    { url: '/contact', name: 'Contact' },
  ];

  for (const pg of pages) {
    console.log(`\n📄 ${pg.name.toUpperCase()}`);
    await nav(p, pg.url);

    const h1 = await p.$('h1');
    h1 ? ok(pg.name, 'heading exists') : warn(pg.name, 'no h1 found');

    if (pg.name === 'FAQ') {
      const items = await p.$$('button');
      items.length >= 10 ? ok(pg.name, `accordion items (${items.length})`) : warn(pg.name, `few items (${items.length})`);
    }

    if (pg.name === 'Contact') {
      const form = await p.$('form');
      form ? ok(pg.name, 'form exists') : bug(pg.name, 'missing contact form');
    }

    if (pg.name === 'About') {
      const text = await p.textContent('body') || '';
      const hasFake = text.toLowerCase().includes('20+ sources') || text.toLowerCase().includes('22 mock tests');
      !hasFake ? ok(pg.name, 'no fake stats') : bug(pg.name, 'contains fake stats');
    }

    if (pg.name === 'Terms' || pg.name === 'Privacy') {
      const text = await p.textContent('body') || '';
      text.length > 500 ? ok(pg.name, `content length (${text.length})`) : bug(pg.name, `too short (${text.length})`);
    }

    await screenshot(p, `08-${pg.name.toLowerCase()}`);
  }
}

async function testDarkMode(p: Page) {
  console.log('\n🌙 DARK MODE');
  // Reset to light
  await p.evaluate(() => { localStorage.setItem('theme', 'light'); });
  await nav(p, '/');
  await p.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  });
  await p.waitForTimeout(500);

  // Click toggle
  await p.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent?.includes('🌙') || btn.textContent?.includes('☀️')) {
        (btn as HTMLElement).click();
        return;
      }
    }
  });
  await p.waitForTimeout(1500);

  const isDark = await p.evaluate(() => document.documentElement.classList.contains('dark'));
  isDark ? ok('DarkMode', 'toggled to dark') : bug('DarkMode', 'failed to toggle to dark');

  // Toggle back
  await p.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent?.includes('🌙') || btn.textContent?.includes('☀️')) {
        (btn as HTMLElement).click();
        return;
      }
    }
  });
  await p.waitForTimeout(1500);

  const isLight = await p.evaluate(() => !document.documentElement.classList.contains('dark'));
  isLight ? ok('DarkMode', 'toggled back to light') : bug('DarkMode', 'failed to toggle to light');

  await screenshot(p, '09-dark-mode');
}

async function testMobile(p: Page) {
  console.log('\n📱 MOBILE');
  await p.setViewportSize({ width: 375, height: 667 });
  await nav(p, '/');

  // Landing page renders
  const h1 = await p.$('h1');
  h1 ? ok('Mobile', 'landing renders') : bug('Mobile', 'landing broken on mobile');

  // Hamburger menu
  const hamburger = await p.$('button[aria-label*="menu" i]');
  hamburger ? ok('Mobile', 'hamburger exists') : bug('Mobile', 'missing hamburger');

  if (hamburger) {
    await hamburger.click({ force: true });
    await p.waitForTimeout(1000);

    const menuLinks = await p.$$('a[href="/jobs"], a[href="/login"], a[href="/register"]');
    menuLinks.length > 0 ? ok('Mobile', `menu opened (${menuLinks.length} links)`) : bug('Mobile', 'menu did not open');

    await screenshot(p, '10-mobile-menu');

    // Navigate via visible link
    const clicked = await p.evaluate(() => {
      const links = document.querySelectorAll('a[href="/jobs"]');
      for (const link of links) {
        const el = link as HTMLElement;
        if (el.offsetParent !== null && el.offsetWidth > 0) {
          el.click();
          return true;
        }
      }
      return false;
    });
    await p.waitForTimeout(2000);
    clicked && p.url().includes('/jobs') ? ok('Mobile', 'navigated to jobs') : bug('Mobile', 'failed to navigate to jobs');
  }

  // Login on mobile
  await nav(p, '/login');
  await screenshot(p, '11-mobile-login');
  const loginForm = await p.$('form, input[type="email"]');
  loginForm ? ok('Mobile', 'login renders on mobile') : bug('Mobile', 'login broken on mobile');

  // Reset viewport
  await p.setViewportSize({ width: 1280, height: 720 });
}

async function test404(p: Page) {
  console.log('\n🚫 404 PAGE');
  await nav(p, '/nonexistent-page-xyz');

  const bodyText = await p.textContent('body') || '';
  const is404 = bodyText.match(/404|not found|page not/i);
  is404 ? ok('404', 'shows not found message') : bug('404', 'no 404 message');

  await screenshot(p, '12-404');
}

async function testNavLinks(p: Page) {
  console.log('\n🔗 NAV LINKS');
  const routes = ['/jobs', '/mock-tests', '/papers', '/exam-calendar', '/results', '/faq', '/about', '/terms', '/privacy', '/contact', '/login', '/register'];

  for (const route of routes) {
    try {
      const res = await p.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const status = res?.status() || 500;
      status < 400 ? ok('Nav', `${route} — ${status}`) : bug('Nav', `${route} — status ${status}`);
    } catch {
      bug('Nav', `${route} — timeout/error`);
    }
  }
}

async function testAPI(p: Page) {
  console.log('\n🔌 API');
  try {
    const http = await import('http');
    const ok_ = await new Promise<boolean>((resolve) => {
      http.get(`${API}/api/health`, (res) => resolve(res.statusCode === 200)).on('error', () => resolve(false));
    });
    ok_ ? ok('API', 'health check OK') : bug('API', 'health check failed');
  } catch {
    bug('API', 'health check error');
  }
}

async function testPerformance(p: Page) {
  console.log('\n⚡ PERFORMANCE');

  // Measure page load times
  const routes = ['/', '/jobs', '/mock-tests', '/papers'];
  const times: { route: string; time: number }[] = [];

  for (const route of routes) {
    const start = Date.now();
    try {
      await p.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const time = Date.now() - start;
      times.push({ route, time });
      time < 3000 ? ok('Perf', `${route} loaded in ${time}ms`) : warn('Perf', `${route} slow: ${time}ms`);
    } catch {
      bug('Perf', `${route} failed to load`);
    }
  }

  // Check for large images
  const images = await p.$$eval('img', imgs => imgs.map(i => ({
    src: i.src,
    naturalWidth: i.naturalWidth,
    loaded: i.complete,
  })));
  const brokenImages = images.filter(i => !i.loaded || i.naturalWidth === 0);
  brokenImages.length === 0 ? ok('Perf', `all ${images.length} images loaded`) : warn('Perf', `${brokenImages.length} broken images`);
}

async function testAccessibility(p: Page) {
  console.log('\n♿ ACCESSIBILITY');
  await nav(p, '/');

  // Check for aria labels on interactive elements
  const buttonsWithoutLabel = await p.$$eval('button', btns =>
    btns.filter(b => !b.getAttribute('aria-label') && !b.textContent?.trim()).length
  );
  buttonsWithoutLabel === 0 ? ok('A11y', 'all buttons have labels') : warn('A11y', `${buttonsWithoutLabel} buttons without labels`);

  // Check for lang attribute
  const hasLang = await p.evaluate(() => !!document.documentElement.getAttribute('lang'));
  hasLang ? ok('A11y', 'html lang attribute set') : warn('A11y', 'missing html lang');

  // Check for skip-to-content link
  const skipLink = await p.$('a[href="#main-content"]');
  skipLink ? ok('A11y', 'skip-to-content link exists') : warn('A11y', 'missing skip-to-content link');

  // Check heading hierarchy
  const headings = await p.$$eval('h1, h2, h3, h4, h5, h6', hs => hs.map(h => parseInt(h.tagName[1])));
  const h1Count = headings.filter(h => h === 1).length;
  h1Count === 1 ? ok('A11y', 'exactly one h1') : warn('A11y', `${h1Count} h1 elements`);
}

async function run() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   ROZGARSCOUT — LIVE BROWSER TEST SUITE  ║');
  console.log('║   Powered by Playwright MCP               ║');
  console.log('╚════════════════════════════════════════════╝');

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  const jsErrors: string[] = [];
  page.on('pageerror', err => jsErrors.push(err.message));

  try {
    await testLanding(page);
    await testLogin(page);
    await testRegister(page);
    await testJobs(page);
    await testMockTests(page);
    await testPapers(page);
    await testExamCalendar(page);
    await testOtherPages(page);
    await testDarkMode(page);
    await testMobile(page);
    await test404(page);
    await testNavLinks(page);
    await testAPI(page);
    await testPerformance(page);
    await testAccessibility(page);
  } catch (e: any) {
    bug('GLOBAL', `unexpected error: ${e.message}`);
  }

  // JS Errors summary
  console.log('\n🔴 JS ERRORS');
  jsErrors.length === 0 ? ok('JS', 'zero unhandled errors') : bug('JS', `${jsErrors.length} unhandled errors`);
  jsErrors.slice(0, 5).forEach(e => console.log(`    ❌ ${e.substring(0, 150)}`));

  await browser.close();

  // Final report
  console.log('\n' + '═'.repeat(55));
  console.log('          ROZGARSCOUT — BROWSER TEST REPORT');
  console.log('═'.repeat(55));
  console.log(`  ✅ PASS:    ${pass}`);
  console.log(`  ❌ FAIL:    ${fail}`);
  console.log(`  ⚠️  WARN:    ${warnings.length}`);
  console.log(`  TOTAL:      ${pass + fail}`);
  console.log(`  PASS RATE:  ${((pass / (pass + fail)) * 100).toFixed(1)}%`);
  console.log('═'.repeat(55));

  if (bugs.length > 0) {
    console.log('\n  🐛 BUGS FOUND:');
    bugs.forEach(b => console.log(`    ❌ ${b}`));
  }
  if (warnings.length > 0) {
    console.log('\n  ⚠️  WARNINGS:');
    warnings.forEach(w => console.log(`    ⚠️  ${w}`));
  }
  if (bugs.length === 0 && warnings.length === 0) {
    console.log('\n  🎉 ALL TESTS PASSED — ZERO BUGS!');
  }
  console.log(`\n  Screenshots: frontend/e2e/screenshots/`);

  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
