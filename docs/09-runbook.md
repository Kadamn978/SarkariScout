# 09 — Runbook (run on ANY local system)

**Version:** 1.0 · **Tested on:** Windows 11 (Laragon), macOS, Ubuntu · **Goal:** fresh machine → working full stack in < 30 minutes

---

## 1. Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | ≥ 20 LTS | all services |
| pnpm | ≥ 9 | workspaces + speed (npm fallback documented) |
| Docker Desktop | latest | postgres + redis locally |
| Git | latest | clone |
| Browser | Chrome/Edge/Firefox | dev + E2E |

Optional: Laragon (Windows users who prefer it — we only need its Node/Docker coexistence; our stack is Docker-native so Laragon isn't required).

## 2. One-time setup

```bash
# 1. Clone
git clone <repo-url> sarkariradar
cd sarkariradar

# 2. Install dependencies (workspaces installs frontend+backend+crawler+e2e)
pnpm install

# 3. Start infra (Postgres + Redis)
docker compose -f infra/docker-compose.yml up -d
# verify: docker compose -f infra/docker-compose.yml ps   → both "healthy"

# 4. Configure environment
cp infra/.env.example .env          # root env consumed by all services
#  .env needs: DATABASE_URL, REDIS_URL, JWT_SECRET, MAILTRAP_* (dev email),
#              BREVO_API_KEY (optional until prod), RAZORPAY_KEY_* (Phase 5)

# 5. Database schema + seed
pnpm --filter backend prisma migrate dev
pnpm --filter backend db:seed       # demo user, 5 sources, ~40 sample jobs, 1 tracked job

# 6. Start everything
pnpm dev                            # runs: backend:3000, frontend:5173, crawler worker
```

## 3. What should be running

| Service | URL | Health check |
|---|---|---|
| API | http://localhost:3000/api/health | `{"status":"ok","db":"up","redis":"up"}` |
| Frontend | http://localhost:5173 | landing page with 3D hero |
| Postgres | localhost:5432 | `docker compose ps` |
| Redis | localhost:6379 | `docker compose ps` |
| Crawler worker | console log | "worker ready, N queues listening" |

## 4. Everyday commands

```bash
pnpm dev            # all services, watch mode
pnpm lint           # eslint all packages
pnpm typecheck      # tsc all packages
pnpm test           # unit + integration (Jest)
pnpm test:e2e       # Playwright: Chromium (full) + Firefox/WebKit (smoke)
pnpm crawl:once     # run one full source sweep manually (dev data refresh)
pnpm digest:now     # force-run the 9 AM digest immediately (test alert)
pnpm seed:reset     # wipe + reseed demo data
```

## 5. First-time smoke test (5 min, real browser)

1. Open http://localhost:5173 → see landing with 3D hero
2. Register `rohit@demo.com` / password → verify email arrives (Mailtrap inbox)
3. Build profile: BE Computer Science, Maharashtra, Hindi+Marathi+English, Open, 24
4. Dashboard → see "5 applicable jobs this week" (seed data)
5. Open a job detail → check deadline countdown + official links + affiliate slot
6. Track a job → tracker shows stages
7. Run `pnpm digest:now` → email arrives in Mailtrap listing only eligible jobs
8. Run `pnpm test:e2e` → all green

## 6. Windows-specific notes

- **Docker Desktop on Windows:** use WSL2 backend; if Hyper-V conflicts with Laragon's Apache, run Laragon services on a different port (8000+) or stop Laragon during docker compose up.
- **Long paths:** enable `git config --global core.longpaths true` before clone.
- **Ports:** if 3000/5173 are busy, override with `PORT` / `VITE_PORT` env vars.
- **PowerShell:** run pnpm via `pnpm.cmd` if aliases fail; avoid `&&` chaining (use `;`).
- **Firewall:** allow node.exe on private networks for local E2E browser launch.

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `DATABASE_URL` connect fail | docker compose up; check port 5432 free; `docker compose logs postgres` |
| Prisma migrate fails on Windows | ensure Node ≥20, delete `node_modules/.prisma` then `pnpm --filter backend prisma generate` |
| E2E browsers not found | `pnpm --filter e2e exec playwright install chromium firefox webkit` |
| Emails not arriving | dev = Mailtrap only (check inbox + integration tab); prod = Brevo, check SPF/DKIM via mail-tester |
| Crawler returns 403 | source rate-limited → backoff active; check logs; switch source to mirror (config flag) |
| Worker not consuming | Redis URL wrong or container down; `docker compose logs redis` |
| HMR slow on Windows | set `VITE_USE_NATIVE_HMR=1`; keep node_modules on NTFS (not network drive) |

## 8. Data backup (local)

```bash
docker compose exec postgres pg_dump -U sarkariradar sarkariradar > backup_$(date +%F).sql
# restore:
docker compose exec -T postgres psql -U sarkariradar sarkariradar < backup_2026-08-20.sql
```

## 9. Production deployment (₹0) — checklist

1. **Neon:** create project → copy pooled DATABASE_URL → `prisma migrate deploy`
2. **Upstash:** create Redis → REDIS_URL
3. **Brevo:** verify domain, set SPF/DKIM/DMARC → API key (dev keeps Mailtrap)
4. **Render:** create web service (backend, `pnpm start:prod`) + background worker (crawler, `pnpm start:worker`) via `infra/render.yaml`; attach env vars
5. **Vercel:** import frontend repo folder, env vars, deploy
6. **cron-job.org:** 9 AM IST digest trigger → `POST https://api.yourdomain.com/cron/digest` (signed secret header), hourly source sweeps
7. **UptimeRobot:** monitor `/api/health` + homepage
8. **DNS:** CNAME www → Vercel; A record → Render (or Cloudflare proxy, free)
9. **Security pass:** run pre-launch checklist (docs/06 §8)

## 10. Rollback

- Backend/worker: Render deploy previous version (one-click)
- Frontend: Vercel instant rollback
- DB: restore nightly pg_dump (Neon PITR on paid later; nightly dumps free via cron)
- Feature flags in admin panel disable risky features without redeploy

## 11. Who does what (support matrix)

| Problem | Action |
|---|---|
| Any runtime issue | Check logs (Render/console), health endpoint, then runbook §7 |
| Source parse failure | Source dashboard → quarantine → fix selector → replay queue |
| Email bounce spike | Pause affected segment → verify domain auth → warm-up plan |
| Security incident | Execute incident plan docs/06 §7 |