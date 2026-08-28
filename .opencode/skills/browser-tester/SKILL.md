---
name: browser-tester
description: Use when performing live browser testing, E2E testing, visual regression testing, or taking screenshots of the running site. Uses Playwright MCP to control a real browser. Trigger on words like "browser test", "e2e", "screenshot", "visual test", "click test", "navigate", "live test", "browser", "playwright mcp", "browser automation".
---

# Browser Tester Skill

You are an expert browser tester using Playwright MCP to perform live end-to-end testing on the SarkariScout web application.

## Prerequisites
- Frontend running at `http://localhost:5173`
- Backend running at `http://localhost:3000`
- Playwright MCP server configured in `.vscode/mcp.json` and `opencode.json`

## How to Use Playwright MCP

The Playwright MCP server provides these tools:
- `browser_navigate` — Go to a URL
- `browser_click` — Click an element
- `browser_type` — Type into an input
- `browser_snapshot` — Get accessibility tree of the page
- `browser_screenshot` — Take a screenshot
- `browser_evaluate` — Run JavaScript in the browser
- `browser_wait_for` — Wait for a condition
- `browser_tab_*` — Manage browser tabs

## Test Workflow

### 1. Page Load Tests
```
For each page route:
  1. Navigate to the page
  2. Take a snapshot (accessibility tree)
  3. Verify key elements exist (h1, forms, buttons, cards)
  4. Take a screenshot
  5. Check for JS errors
```

### 2. Navigation Tests
```
1. Start at landing page
2. Click each nav link
3. Verify URL changes correctly
4. Verify page content loads
5. Test back button
```

### 3. Form Tests
```
1. Login: try invalid credentials, verify error message
2. Register: fill form, verify validation
3. Contact: fill form, verify submit
4. Search: type in search box, verify results filter
```

### 4. Interactive Tests
```
1. Dark mode toggle: click, verify class changes
2. Mobile hamburger: resize viewport, click, verify menu opens
3. FAQ accordion: click items, verify expand/collapse
4. Exam Calendar views: click List/Grid/Calendar, verify switch
```

### 5. Visual Tests
```
1. Take full-page screenshots of each page
2. Verify dark mode renders correctly
3. Verify mobile layout (375px viewport)
4. Check for layout shifts or broken elements
```

## Routes to Test

| Route | Page | Key Elements |
|-------|------|--------------|
| `/` | Landing | Hero, nav, footer, stats, job cards |
| `/login` | Login | Email/pass inputs, Google OAuth, submit |
| `/register` | Register | Name/email/pass, T&C checkbox, submit |
| `/jobs` | Jobs | Job cards, search, filters |
| `/jobs/:id` | Job Detail | Title, description, apply button |
| `/mock-tests` | Mock Tests | Test cards |
| `/papers` | Papers | Paper cards |
| `/exam-calendar` | Exam Calendar | 3 view modes |
| `/results` | Results | Result list |
| `/faq` | FAQ | Accordion items |
| `/about` | About | Company info |
| `/terms` | Terms | Legal text |
| `/privacy` | Privacy | Legal text |
| `/contact` | Contact | Contact form |

## Bug Detection Checklist

- [ ] Page loads without errors
- [ ] No console JS errors
- [ ] All links navigate correctly
- [ ] Forms validate input
- [ ] Dark mode toggles properly
- [ ] Mobile menu opens/closes
- [ ] No broken images or missing assets
- [ ] Loading states show skeletons
- [ ] 404 page shows for invalid routes
- [ ] API health check returns OK

## Running Tests Manually (without MCP)

```bash
# Run the comprehensive browser test
cd frontend && npx tsx e2e/manual-browser-test.ts

# Run specific test
npx tsx -e "
import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  // ... test code
  await browser.close();
})();
"
```

## Screenshot Locations
All screenshots saved to: `frontend/e2e/screenshots/`
