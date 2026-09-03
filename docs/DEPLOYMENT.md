# Deployment Runbook

Generalized guide for deploying RozgarScout to Vercel (frontend) and Railway (backend).

> **Security:** This document contains zero secrets, zero API keys, and zero project IDs.
> All sensitive values are set as environment variables in the hosting platform dashboards.

---

## Architecture Overview

```
Frontend (React + Vite)  →  Vercel (auto-deploy from Git)
Backend (NestJS + Prisma) →  Railway (deploy via CLI or Git)
Database (MySQL)          →  Railway (managed service)
Cache (Redis)             →  Railway (managed service)
```

- **Frontend** is a static SPA served by Vercel's CDN
- **Backend** runs in a Docker container on Railway
- **No nginx** is used in the current deployment
- **Google Cloud Console** must have the backend callback URL added as an authorized redirect URI

---

## Prerequisites

- Node.js 22+ installed locally
- Railway CLI installed (`npm install -g @railway/cli` or use `npx @railway/cli`)
- Vercel CLI installed (`npm install -g vercel` or use `npx vercel`)
- GitHub repository connected to both Vercel and Railway
- Railway account with project created
- Vercel account linked to GitHub

---

## Environment Variables

### Where to set them

| Platform | Where |
|----------|-------|
| Vercel (frontend) | Vercel Dashboard → Project → Settings → Environment Variables |
| Railway (backend) | Railway Dashboard → Service → Variables tab |

### Frontend Variables (Vercel)

| Variable | Dev Value | Test/Pilot Value | Production Value |
|----------|-----------|-------------------|------------------|
| `VITE_API_URL` | `/api` | `https://<railway-backend-url>/api` | `https://<custom-domain>/api` |
| `VITE_APP_NAME` | `RozgarScout` | `RozgarScout` | `RozgarScout` |
| `VITE_SENTRY_DSN` | *(empty)* | Set from Sentry dashboard | Set from Sentry dashboard |

### Backend Variables (Railway)

| Variable | Dev Value | Test/Pilot Value | Production Value |
|----------|-----------|-------------------|------------------|
| `DATABASE_URL` | `mysql://root@127.0.0.1:3306/sarkariscout` | *(auto from Railway MySQL)* | *(auto from Railway MySQL)* |
| `REDIS_URL` | `redis://localhost:6379` | *(auto from Railway Redis)* | *(auto from Railway Redis)* |
| `JWT_SECRET` | *(min 32 chars)* | *(generate random hex)* | *(generate random hex)* |
| `PORT` | `3000` | `3000` | `3000` |
| `NODE_ENV` | `development` | `production` | `production` |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | `https://<vercel-url>,https://<custom-domain>` | `https://<custom-domain>,https://www.<custom-domain>` |
| `TZ` | `Asia/Kolkata` | `Asia/Kolkata` | `Asia/Kolkata` |
| `SMTP_HOST` | *(Mailtrap host)* | `smtp.gmail.com` | `smtp.gmail.com` |
| `SMTP_PORT` | `2525` | `587` | `587` |
| `SMTP_USER` | *(Mailtrap user)* | *(Gmail address)* | *(Gmail address)* |
| `SMTP_PASS` | *(Mailtrap pass)* | *(Gmail app password)* | *(Gmail app password)` |
| `SMTP_FROM` | *(any)* | `RozgarScout <noreply@<domain>>` | `RozgarScout <noreply@<domain>>` |
| `SMTP_SECURE` | `false` | `false` | `false` |
| `GOOGLE_CLIENT_ID` | *(from Google Console dev)* | *(from Google Console prod)* | *(from Google Console prod)* |
| `GOOGLE_CLIENT_SECRET` | *(from Google Console dev)* | *(from Google Console prod)* | *(from Google Console prod)* |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3000/api/auth/google/callback` | `https://<railway-backend-url>/api/auth/google/callback` | `https://<custom-domain>/api/auth/google/callback` |
| `FRONTEND_URL` | `http://localhost:5173` | `https://<vercel-url>` | `https://<custom-domain>` |
| `ENCRYPTION_KEY` | *(32 hex chars)* | *(generate random)* | *(generate random)` |
| `SENTRY_DSN` | *(empty)* | *(from Sentry dashboard)* | *(from Sentry dashboard)` |
| `COOKIE_DOMAIN` | *(empty)* | *(empty)* | *(empty unless same domain)* |

### How to Generate Secrets

```bash
# Generate a 32-character hex string (for JWT_SECRET, ENCRYPTION_KEY)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deploying Frontend to Vercel

### Option A: Via Git (Recommended)

1. Push to GitHub on the `test` branch → triggers **preview** deployment
2. Push to `main` branch → triggers **production** deployment
3. CI runs automatically before deploy (tests + typecheck + build)

### Option B: Via CLI (Manual)

```bash
cd frontend
npx vercel --prod          # Deploy to production
npx vercel                 # Deploy preview
```

### Vercel Project Setup

1. Import GitHub repo in Vercel dashboard
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variables in Settings → Environment Variables

---

## Deploying Backend to Railway

### Option A: Via CLI (Recommended for Pilot)

```bash
cd backend

# Build locally first to verify
npx prisma generate
npx tsc -p tsconfig.build.json

# Deploy to Railway
npx @railway/cli up --service <service-name>
```

### Option B: Via Git (for CI/CD)

Connect Railway to GitHub repo. Railway auto-deploys on push.

### Railway Project Setup

1. Create new Railway project
2. Add services:
   - **Backend**: Deploy from GitHub repo, set root directory to `backend`
   - **MySQL**: Add MySQL plugin (managed)
   - **Redis**: Add Redis plugin (managed)
3. Set environment variables in each service's Variables tab
4. Railway auto-generates `DATABASE_URL` and `REDIS_URL` for MySQL/Redis services

### Dockerfile

The backend uses a multi-stage Dockerfile:
- **Builder stage**: `node:20-bullseye-slim` with OpenSSL + Prisma generate + TypeScript build
- **Runtime stage**: `node:20-bullseye-slim` with OpenSSL + production deps + compiled JS

The `startup.js` script runs `prisma db push` before starting the app (auto-migrates on deploy).

---

## Google OAuth Setup

### Google Cloud Console

1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add **Authorized redirect URIs**:
   - For testing: `https://<railway-backend-url>/api/auth/google/callback`
   - For production: `https://<custom-domain>/api/auth/google/callback`
4. Copy the **Client ID** and **Client Secret** to Railway environment variables

### Important

- The `GOOGLE_CALLBACK_URL` env var must match EXACTLY what's in Google Cloud Console
- Different environments (test vs production) need different callback URIs
- Add each environment's callback URI to the same Google Cloud Console project

---

## Sentry Setup

Sentry is **production-only** — it does NOT run in development mode.

### Frontend

1. Create a Sentry project for the frontend
2. Copy the DSN to `VITE_SENTRY_DSN` in Vercel environment variables
3. The code checks `import.meta.env.VITE_SENTRY_DSN` AND `import.meta.env.PROD` before initializing

### Backend

1. Create a Sentry project for the backend
2. Copy the DSN to `SENTRY_DSN` in Railway environment variables
3. The code checks `process.env.SENTRY_DSN` AND `NODE_ENV === 'production'` before initializing
4. Sensitive data (cookies, auth headers) is stripped before sending to Sentry

### Why Production Only

- Dev errors go to browser console / server logs (no Sentry quota consumed)
- Production errors are captured with full context (stack traces, breadcrumbs, user context)
- Reduces Sentry quota usage during development

---

## CI/CD Pipeline

### GitHub Actions

- **`ci.yml`**: Runs on every push to `pre-dev`, `test`, `release/**`, `main`
  - Frontend: typecheck + tests + build
  - Backend: typecheck + build
- **`deploy.yml`**: Deploys to Vercel
  - `pre-dev` and `test` branches → **preview** deployment
  - `main` branch → **production** deployment

### Prod Deployment Halt

Production deployment is **halted** until a custom domain is purchased:
- Vercel production deploy only triggers from `main` branch
- Railway deploy is manual via CLI (not auto-deploy)
- **Do not merge to `main`** until domain is configured

---

## Troubleshooting

### Backend 429 Too Many Requests

Railway free tier has rate limits. If you get 429:
- Wait 2 minutes before retrying
- Reduce request frequency during testing
- This is Railway's infrastructure limit, not our application

### Backend Crash on Deploy

Check Railway build logs:
```bash
npx @railway/cli logs --service <service-name> --build --lines 50
```

Common causes:
- `libssl.so.1.1: not found` → Dockerfile needs `node:20-bullseye-slim` (not Alpine)
- TypeScript errors → Run `npx tsc -p tsconfig.build.json --noEmit` locally
- Prisma errors → Run `npx prisma generate` locally

### Frontend Build Failures

```bash
cd frontend
npx tsc --noEmit     # Check for type errors
npx vite build       # Check for build errors
```

### Google OAuth Redirect Mismatch

- Ensure `GOOGLE_CALLBACK_URL` env var matches the URI in Google Cloud Console exactly
- Check for trailing slashes, http vs https, port numbers

### Database Migration Not Applied

The `startup.js` runs `prisma db push` on every deploy. If it fails:
```bash
npx prisma db push --accept-data-loss  # Local
# On Railway: check startup logs in deploy output
```

---

## Rollback

### Vercel

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

### Railway

1. Go to Railway Dashboard → Service → Deployments
2. Find the last successful deployment
3. Click "Redeploy"
