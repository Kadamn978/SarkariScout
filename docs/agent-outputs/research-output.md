# Competitive Intelligence — competitor monitoring, market analysis, feature gaps Output

## Competitive Intelligence – SarkariScout vs. Top 3 Competitors  
**Competitors analysed:** Testbook, Adda247, Sarkari Result  
**Goal:** Pinpoint the single feature SarkariScout should build *right now* to close the biggest gap and start gaining traction.

---

### 1️⃣ Competitor Snapshot (What they do well)

| Feature | Testbook | Adda247 | Sarkari Result | SarkariScout (Current) |
|---------|----------|---------|----------------|------------------------|
| **Job Aggregation & Alerts** | ✔️ (real‑time push, state‑wise filters) | ✔️ (SMS/WhatsApp + app push) | ✔️ (web‑only, email alerts) | ✔️ (basic listing, email/JWT) |
| **Mock Test Series** | ✔️ (10k+ tests, adaptive, timed, leaderboard) | ✔️ (sectional, full‑length, video solutions) | ❌ (only PDFs, no interactive test) | ✔️ (tables exist, but no UI/flow) |
| **Performance Analytics** | ✔️ (detailed reports, weakness heat‑map, progress tracking) | ✔️ (AI‑driven score predictor, rank comparison) | ❌ | ❌ (only raw scores stored) |
| **Video Lectures / Live Classes** | ✔️ (pre‑recorded + daily live batches) | ✔️ (Adda247 Live, doubt clearing) | ❌ | ❌ |
| **Resume / Profile Builder** | ✔️ (AI‑resume checker, downloadable PDF) | ✔️ (Resume builder + cover letter) | ❌ | ❌ (only Document Wallet for uploads) |
| **Community & Doubt Solving** | ✔️ (discussion forums, expert Q&A) | ✔️ (live chat, mentor support) | ❌ (comment section on jobs) | ❌ (Bug Report only) |
| **Offline Access** | ✔️ (download PDFs, test PDFs) | ✔️ (offline video, test PDFs) | ❌ | ❌ |
| **Multilingual UI** | ✔️ (Hindi + English) | ✔️ (Hindi, English, Bengali) | ❌ (English only) | ❌ (English only) |
| **Gamification / Rewards** | ✔️ (badges, coins, daily streaks) | ✔️ (points, leaderboard) | ❌ | ❌ |
| **AI‑Powered Job Matching** | ✔️ (skill‑based recommendation engine) | ✔️ (AI resume‑to‑job match) | ❌ | ❌ (static listing) |
| **Paid Subscription Model** | ✔️ (Tiered plans, test series bundles) | ✔️ (Adda247 Prime, test series) | ❌ (mostly free, ads) | ❌ (free only) |

> **Takeaway:** All three leaders differentiate themselves primarily through **interactive preparation tools** (mock tests + analytics + live classes) and **career‑enablement features** (resume builder, AI job matching, community). SarkariScout already has the data layer for mock tests but lacks the user‑facing experience and analytics that drive engagement and monetisation.

---

### 2️⃣ Gap Analysis – Where SarkariScout Falls Short

| Gap Category | Missing / Weak | Impact on Users | Competitive Advantage if Fixed |
|--------------|----------------|----------------|--------------------------------|
| **Interactive Test Experience** | No UI to start a test, no timer, no instant answer review, no leaderboard | Users must go elsewhere for practice → lower retention | Becomes a one‑stop shop for prep; increases session time & DAU |
| **Performance Analytics & Adaptive Learning** | Only raw scores stored; no dashboards, no weakness identification | Users can’t gauge improvement → frustration & churn | Personalised learning path drives higher conversion to paid plans |
| **Live / Video Classes** | None | Misses out on high‑engagement, high‑value content that competitors monetise | Opens premium subscription revenue & upsell opportunities |
| **Resume / Profile Builder** | Only document upload; no AI‑guided CV creation | Users rely on external tools → friction in application flow | Improves application success rate → higher user satisfaction & word‑of‑mouth |
| **Community & Doubt Solving** | Only bug reports; no peer‑to‑peer or expert Q&A | Users feel isolated; trust in platform diminishes | Builds sticky ecosystem; reduces support load via peer help |
| **Offline & Multilingual Support** | None | Limits reach in low‑bandwidth regions & non‑English speakers | Expands addressable market (Tier‑2/3 cities, Hindi‑speaking aspirants) |
| **AI‑Powered Job Matching** | Static listing; no skill‑based recommendations | Users miss relevant jobs → lower application rate | Increases job‑apply conversion; creates data network effect |
| **Gamification / Retention Hooks** | None | Low motivation to return daily | Improves habit formation; boosts DAU/MAU ratio |

---

### 3️⃣ **Most Urgent Feature to Build:**  
## **Interactive Mock Test Suite with AI‑Driven Performance Analytics**

### Why this tops the list
1. **Foundation already exists** – The `MockTest` and `MockQuestion` tables are in place; we only need the front‑end flow, timer, answer evaluation, and analytics layer.
2. **Highest impact on core user goal** – Aspirants come to SarkariScout for *government job prep*. A robust test experience directly addresses that need, increasing perceived value instantly.
3. **Monetisation gateway** – Test series are the primary paid product for Testbook & Adda247. Launching a premium test bundle unlocks revenue **within weeks** of launch.
4. **Data network effect** – Every test taken feeds the analytics engine, improving job‑matching AI later (a natural next step).
5. **Differentiator vs. Sarkari Result** – Sarkari Result offers only static PDFs; an interactive test platform puts SarkariScout ahead of the only pure‑aggregator competitor.
6. **Low‑risk, high‑reward** – No need to negotiate content licenses immediately; we can start with **open‑source question banks** (e.g., previous year papers, RBI, SSC, UPSC) and gradually add licensed content.

---

### 4️⃣ Actionable Implementation Plan (8‑Week Sprint)

| Week | Milestone | Tasks (Frontend) | Tasks (Backend) | Acceptance Criteria |
|------|-----------|------------------|-----------------|----------------------|
| **1** | **Foundations & UI Kit** | - Set up React‑Router routes: `/tests`, `/tests/:id`, `/tests/:id/result`<br>- Create reusable TestCard, Timer, QuestionCard components (Tailwind) | - Extend `MockTest` model: add `durationMinutes`, `isPaid`, `difficultyLevel`<br>- Add `TestAttempt` table (userId, testId, startTime, endTime, score, answers JSON) | - Routes load without errors<br>- DB migrations succeed |
| **2** | **Test Player Core** | - Implement question navigation (prev/next, jump‑to)<br>- Timer with warning at 30s left<br>- Answer selection (single/multiple) & auto‑save to localStorage | - API: `POST /tests/:id/start` → creates TestAttempt<br>- API: `POST /tests/:id/answer` → stores answer<br>- API: `GET /tests/:id/questions` (paginated) | - User can start a test, answer questions, timer works, answers persist on refresh |
| **3** | **Instant Review & Scoring** | - Show correct/incorrect highlight after submit<br>- Display explanation (if available)<br>- Compute score on submit | - API: `POST /tests/:id/submit` → finalises attempt, calculates score based on answer key<br>- Store explanation in `MockQuestion.explanation` (nullable) | - Submit shows % score, correct/incorrect breakdown, explanations |
| **4** | **Leaderboard & Streaks** | - Leaderboard component: top 10 scores for test (global & friends)<br>- Daily streak badge (if test attempted today) | - Add `Leaderboard` view (aggregated scores)<br>- Add `UserStreak` table (lastAttemptDate, streakCount) | - Leaderboard updates within 5 min of submission<br>- Streak increments correctly |
| **5** | **Performance Analytics Dashboard** | - Dashboard page: `/analytics`<br>- Charts: score trend, topic‑wise accuracy, time‑per‑question (using Chart.js/recharts)<br>- Weakness heat‑map (tags from questions) | - Add `QuestionTopic` (many‑to‑many) table<br>- API: `GET /analytics/user` → returns aggregated stats<br>- Pre‑compute nightly aggregates via Redis‑backed worker (Node bullmq) | - Dashboard loads <2 s, shows at least 3 meaningful charts<br>- Data matches stored attempts |
| **6** | **Paid Test Series & Access Control** | - UI badge: “Locked” / “Free”<br>- Purchase flow (Stripe test mode) → unlock test | - Add `Subscription` & `UserSubscription` tables<br>- Middleware: `guardPaidTest` checks user’s plan<br>- Webhook to activate paid access on successful payment | - Free users see lock; paid users can start test<br>- Stripe test payment unlocks access |
| **7** | **Offline Download (PDF) & Multilingual Toggle** | - Button: “Download PDF” (uses jsPDF)<br>- Language selector (English/Hindi) → i18n via react‑i18next | - Add `language` column to `User` (default EN)<br>- PDF generation endpoint: `GET /tests/:id/pdf` (server‑side using puppeteer) | - PDF download works, contains questions + answer key<br>- UI switches language without reload |
| **8** | **Beta Launch & Feedback Loop** | - Invite‑only beta (existing users)<br>- In‑app feedback modal after each test | - Log analytics events (testStart, testSubmit, dashboardView) to Redis stream for later analysis | - ≥80 % beta users rate usefulness ≥4/5<br>- Collect ≥50 actionable suggestions for next iteration |

> **Estimated effort:** ~2‑3 frontend engineers + 2 backend engineers + 1 DevOps (for Redis worker). Total ≈ **600‑800 hours** (≈10‑12 person‑weeks).  
> **Cost‑saving tip:** Leverage the existing Prisma schema; only add a few new tables and reuse the JWT auth middleware.

---

### 5️⃣ Success Metrics (Post‑Launch, 30‑day window)

| Metric | Target | Why it matters |
|--------|--------|----------------|
| **Daily Active Users (DAU) on test pages** | ↑ 30 % vs baseline | Indicates stickiness |
| **Test completion rate** | ≥ 70 % of started tests | Shows usability & engagement |
| **Conversion to paid test series** | ≥ 5 % of test‑takers | Early monetisation proof |
| **Average session length** | ≥ 8 min (up from 3 min) | Higher engagement → better SEO & ad revenue |
| **User satisfaction (NPS)** | ≥ +20 | Predicts word‑of‑mouth growth |
| **Retention (Day‑7)** | ≥ 25 % | Measures habit formation |

---

### 6️⃣ Quick Wins While Building the Full Suite (Optional)

| Win | Effort | Impact |
|-----|--------|--------|
| **Add a “Start Test” button on each Job card** (link to a generic 10‑question quiz) | 2 h (frontend) | Immediate exposure, drives traffic to test flow |
| **Show “Top 5 Recent Mock Tests” on homepage** | 1 h (frontend + API) | Increases discoverability |
| **Integrate OpenRouter/Groq AI to generate explanations for existing questions** | 4 h (backend) | Improves user experience without manual content creation |
| **Enable email notification when a new test is added in user’s preferred state/qual** | 3 h (backend + Redis) | Re‑engages users via familiar channel |

---

## TL;DR – What SarkariScout Should Build **Now**

> **Launch an interactive mock‑test platform with instant scoring, performance analytics, and a paid‑access model.**  
> This leverages existing data, directly serves the core job‑prep need, creates a clear monetisation path, and sets the foundation for later AI‑driven job matching, resume building, and live classes.

Implement the 8‑week sprint above, track the success metrics, and you’ll move SarkariScout from a pure aggregator to a **competitive prep destination** that can challenge Testbook and Adda247 on the very features they monetize today. 🚀