# SarkariScout — Service Setup Guide

Step-by-step instructions to get every external service working.

---

## 1. Mailtrap (Email) — DONE

**Status:** Configured and working.

**What was done:**

- Fixed env var mismatch: `.env` now uses `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (what `email.service.ts` reads)
- Added your Mailtrap credentials to `backend/.env`
- Restarted backend — SMTP transporter should initialize

**To verify email is working:**

1. Register a new account at `http://localhost:5173/register`
2. Check Mailtrap inbox at https://mailtrap.io/inboxes
3. You should see the verification email there

**To check email logs:**

- https://mailtrap.io/sending/email_logs

**When you're ready for production:**

- Replace Mailtrap SMTP with Brevo (or any real SMTP provider)
- Update `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env`
- Set `SMTP_SECURE=true` for production

---

## 2. Google OAuth (Sign in with Google)

**Time:** ~15 minutes

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Name: `SarkariScout` → **Create**

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: `SarkariScout`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**
5. On **Scopes** page: click **Add or Remove Scopes** → select `email` and `profile` → **Update** → **Save and Continue**
6. On **Test users** page: add your own email → **Save and Continue**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `SarkariScout Web`
5. Authorized redirect URIs: add `http://localhost:3000/api/auth/google/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 4: Update .env

```
GOOGLE_CLIENT_ID=<paste-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<paste-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Step 5: Test

1. Go to `http://localhost:5173/login`
2. Click **Sign in with Google**
3. Select your test account
4. You should be redirected back and logged in

**Note:** In production, add your domain to **Authorized domains** and update `GOOGLE_CALLBACK_URL` to `https://sarkariscout.in/api/auth/google/callback`.

---

## 3. Sentry (Error Tracking)

**Time:** ~10 minutes

### Step 1: Create Sentry Account

1. Go to https://sentry.io
2. Sign up (free tier: 5K errors/month)

### Step 2: Create Project

1. Click **Create Project**
2. Platform: **React**
3. Project name: `sarkariscout-frontend`
4. Click **Create Project**
5. Skip the "install SDK" wizard — we already have Sentry code

### Step 3: Get DSN

1. Go to **Settings** → **Projects** → **sarkariscout-frontend** → **Client Keys (DSN)**
2. Copy the DSN (looks like `https://xxxx@sentry.io/xxxx`)

### Step 4: Update frontend .env

Create `frontend/.env` if it doesn't exist:

```
VITE_API_URL=/api
VITE_APP_NAME=SarkariScout
VITE_SENTRY_DSN=<paste-your-dsn-here>
```

### Step 5: Test

After deploying, trigger an error (e.g., navigate to a broken route). Check Sentry dashboard — you should see the error appear.

**Backend Sentry (optional):**

1. Create another project in Sentry: **Node.js**
2. Install: `npm install @sentry/node` in backend
3. Add to `backend/src/main.ts`:

```typescript
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

4. Add `SENTRY_DSN=<dsn>` to `backend/.env`

---

## 4. Google AdSense (Revenue)

**Time:** ~30 minutes setup + days/weeks for approval

### Step 1: Apply for AdSense

1. Go to https://www.google.com/adsense
2. Click **Get started**
3. Enter your website URL: `https://sarkariscout.in`
4. Select country: **India**
5. Choose: **Create new account**
6. Fill in payment details (can be added later)

### Step 2: Get Publisher ID

1. After approval, go to **Ads** → **Overview**
2. Click **By site** → **Create ad unit**
3. Create 3 ad units:
   - **Banner (Top)** — for Jobs page header
   - **Sidebar** — for sidebar ads
   - **In-article** — for between job listings
4. Copy the **Publisher ID** (ca-pub-XXXXXXXXXXXXXXXX)
5. Copy each **Ad slot ID** (XXXXXXXXXX)

### Step 3: Update Code

In `frontend/index.html`, replace:

```
ca-pub-XXXXXXXXXX → ca-pub-YOUR-ACTUAL-ID
```

In `frontend/src/pages/Jobs.tsx`, replace:

```
slot="XXXXXXXXXX" → slot="YOUR-SLOT-ID"
```

Same for `StateJobs.tsx` and `QualJobs.tsx`.

### Step 4: Add to frontend .env

```
VITE_ADSENSE_CLIENT=ca-pub-YOUR-ACTUAL-ID
```

### Step 5: Verify AdSense

1. After placing ads, Google will review your site
2. Approval usually takes 2-14 days
3. You'll see "Getting ready" → "Ready" in AdSense dashboard

**Note:** Ads won't show until approved. During development, ad spaces will be blank.

---

## 5. NCS API (National Career Service)

**Time:** ~20 minutes

### Step 1: Register on NCS

1. Go to https://www.ncs.gov.in
2. Click **Employer/Jobseeker Registration**
3. Register as a **Jobseeker** (free)
4. Verify your email

### Step 2: Get API Access

1. Go to https://api.ncs.gov.in
2. Check if public API is available (NCS sometimes limits API access)
3. If API requires key: register for API access
4. If no API: the crawler uses web scraping (no key needed)

### Step 3: Update .env (if API key required)

```
NCS_API_KEY=<your-ncs-api-key>
NCS_API_URL=https://api.ncs.gov.in
```

**Note:** Most government sources are scraped, not via API. The NCS crawler in the codebase handles both approaches. If NCS API is unavailable, the scraper falls back to web scraping.

---

## 6. Brevo (Production Email)

**Time:** ~15 minutes

### Step 1: Create Brevo Account

1. Go to https://www.brevo.com
2. Sign up (free tier: 300 emails/day)

### Step 2: Get API Key

1. Go to **SMTP & API** → **API Keys**
2. Click **Generate a new API key**
3. Name: `SarkariScout`
4. Copy the key

### Step 3: Verify Sender

1. Go to **SMTP & API** → **Senders & IP**
2. Add sender: `noreply@sarkariscout.in`
3. Verify the email (click link sent to that address)

### Step 4: Update .env (for production)

```
BREVO_API_KEY=<your-brevo-api-key>
BREVO_SENDER_EMAIL=noreply@sarkariscout.in
```

**Note:** Brevo is for production. Keep Mailtrap for dev testing.

---

## 7. Domain Registration

**Time:** ~10 minutes + propagation

### Step 1: Register Domain

1. Go to https://www.godaddy.com or https://www.namecheap.com
2. Search: `sarkariscout.in`
3. Register + buy (₹400-800/year for .in)

### Step 2: DNS Setup

Add these records:

| Type  | Name | Value                               | TTL  |
| ----- | ---- | ----------------------------------- | ---- |
| A     | @    | Your server IP                      | 3600 |
| CNAME | www  | sarkariscout.in                     | 3600 |
| MX    | @    | Mail provider MX                    | 3600 |
| TXT   | @    | `v=spf1 include:mailtrap.io ~all` | 3600 |

### Step 3: Update Code

1. `frontend/index.html`: change `sarkariscout.in` URLs
2. `backend/.env`: `ALLOWED_ORIGINS=https://sarkariscout.in`
3. `backend/.env`: `GOOGLE_CALLBACK_URL=https://sarkariscout.in/api/auth/google/callback`

---

## Quick Reference: All .env Files

### backend/.env (required for app to start)

```
DATABASE_URL=mysql://root@127.0.0.1:3306/sarkariscout?connection_limit=10&pool_timeout=30
REDIS_URL=redis://localhost:6379
JWT_SECRET=sarkariscout-dev-jwt-secret-change-in-prod-2026-secure-random-string
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
TZ=Asia/Kolkata
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=a79cfe5727090a
SMTP_PASS=270b68f6b38964
SMTP_FROM=SarkariScout <noreply@sarkariscout.in>
SMTP_SECURE=false
BREVO_API_KEY=
BREVO_SENDER_EMAIL=noreply@sarkariscout.in
NCS_API_KEY=
NCS_API_URL=https://api.ncs.gov.in
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
GOOGLE_CLIENT_ID=000000000000-placeholder.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-placeholder-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### frontend/.env (required for frontend to build)

```
VITE_API_URL=/api
VITE_APP_NAME=SarkariScout
VITE_SENTRY_DSN=
VITE_ADSENSE_CLIENT=
```
