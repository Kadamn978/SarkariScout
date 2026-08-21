# 10 — Test Plan (unit / integration / real-browser E2E)

**Version:** 1.0 · **Tooling:** Jest (unit+integration, backend) · Vitest (frontend) · **Playwright** (real browsers: Chromium, Firefox, WebKit) · CI: GitHub Actions free tier

---

## 1. Test strategy

| Level | Where | Coverage target | Gate |
|---|---|---|---|
| Unit | backend modules (matching, dedup, dates, fingerprint, normalizer) | ≥ 80% on core logic | CI: must pass |
| Unit | frontend components/hooks (profile form, tracker state, ad slots) | ≥ 60% | CI: must pass |
| Integration | backend + Postgres + Redis (docker) | all API flows | CI: must pass |
| E2E | Playwright, real browsers, seeded DB, real email (Mailtrap) | every 🔴/🟠 feature | CI: Chromium full; FF/WebKit smoke |
| Security | OWASP ZAP baseline + abuse probes (see docs/06) | no HIGH/CRITICAL | Pre-launch |
| Manual | design review, ad-layout audit, browser matrix (Safari/Android) | release checklist | Each release |

**Rule:** a feature is "done" only when its test cases below pass — including E2E in a real browser. No exceptions.

## 2. Test data

- **Seed:** 1 demo user (Rohit), 40 jobs covering: open/closed deadlines, fee-window-open/closed, all-India vs Maharashtra, each qualification level, multilingual (Hindi/Marathi) dates, 2 duplicate entries (same job 2 sources) to prove dedup.
- **Fixture emails:** Mailtrap project inbox (dev) — digest assertions read actual received emails.
- **Time control:** frozen "now" (23:59:30 IST edge) to test the midnight deadline rule deterministically.

## 3. Test case inventory (by feature, map → docs/02)

### F-02 Auth
| ID | Test | Level | Assert |
|---|---|---|---|
| T-01 | Register with valid email+password → verify email link → login | E2E | 200, JWT cookie set, welcome email received |
| T-02 | Register with invalid email / weak password | E2E | blocked by Zod + UI errors |
| T-03 | Login 5 wrong passwords → locked 15 min | Int | 429 + lock message |
| T-04 | Forgot password → token email → reset → login with new | E2E | flow works; old password rejected |
| T-05 | Refresh token rotation + reuse detection | Int | old refresh rejected after use |
| T-06 | Unauthenticated /admin redirects to login | E2E | redirect, no data leak |

### F-03 Profile
| T-10 | Build full profile (BE CS, MH, Hi/Mr/En, Open, 24) → persisted | E2E | GET profile returns saved values |
| T-11 | Edit profile → matching results change accordingly | Int | recompute happens |
| T-12 | XSS payload in "name" field renders inert | E2E | no script execution |
| T-13 | DOB < 18 rejected (DPDP age gate) | E2E | validation error |
| T-14 | Delete account → PII purged (erasure) | Int | rows gone from users/profiles |

### F-04..F-09 Data engine
| T-20 | RSS fixture parsed → structured Job created | Int | fields mapped correctly |
| T-21 | HTML fixture (IBPS-style) parsed | Int | stable selectors → fields |
| T-22 | Hindi/Marathi date string ("१० ऑगस्ट २०२६", "5 ऑगस्ट") → ISO | Unit | correct IST timestamps |
| T-23 | Same job from 2 sources → 1 canonical Job | Int | dedup fingerprint works, no dupes |
| T-24 | Source down (503 fixture) → source marked unhealthy, system continues | Int | health status + no crash |
| T-25 | Unknown domain in registry rejected by crawler (SSRF) | Int | request blocked |
| T-26 | Malformed/oversized feed → quarantined, admin notified | Int | review queue entry |

### F-10/F-11 Matching + deadline guard (the core promise)
| T-30 | Rohit profile: eligible SSC/IBPS/RRB/MPSC jobs only | Unit | all hard rules pass, no false positives |
| T-31 | Qualification mismatch (BE vs 12th-only job) → NOT eligible | Unit | excluded |
| T-32 | Age out of range → NOT eligible | Unit | excluded |
| T-33 | State mismatch (Rajasthan-only vs MH) → NOT eligible | Unit | excluded |
| T-34 | applyEnd = today 23:59:59 → ELIGIBLE; applyEnd = today 00:00:01 → NOT | Unit | midnight edge exact |
| T-35 | applyEnd open but feeEnd closed → NOT eligible | Unit | fee window enforced |
| T-36 | Job with unverifiable dates → quarantined, never alerted | Unit | exclusion |
| T-37 | Score ranking stable (no infinite loops, deterministic) | Unit | snapshot test |

### F-12/F-13/F-19 Notifications
| T-40 | Digest at 9 AM IST contains only eligible, deadline-open jobs | E2E | actual email in Mailtrap matches expected set |
| T-41 | Digest excludes jobs already in previous digest (no repeat spam) | Int | diff-set logic |
| T-42 | Digest cap 15 jobs + "view all" link | Int | cap enforced |
| T-43 | Instant alert fired on change event for tracking users only | Int | recipient set correct |
| T-44 | One-click unsubscribe link works without login | E2E | token route, digest stops |
| T-45 | Bounce ×3 → user auto-muted + admin alert | Int | muted flag set |
| T-46 | Digest respects notifyDigest=false | Int | no email |

### F-14/F-15/F-18 UI
| T-50 | Job detail page shows dates, fees, eligibility, official links | E2E | all sections render |
| T-51 | Search + filters (org, state, family, date range) | E2E | results correct |
| T-52 | Dashboard stats correct after tracker actions | E2E | counts match seed |
| T-53 | Mobile viewport (375px) — no horizontal scroll, no broken layout | E2E | layout audit |
| T-54 | Dark/light theme persists | E2E | localStorage + CSS vars |

### F-16 Change detection
| T-60 | Fixture page changes exam date → JobChange(EXAM_DATE) created | Int | before/after captured |
| T-61 | Venue change → alert to trackers only | Int | recipients correct |
| T-62 | Corrigendum/deadline extension detected | Int | event type correct |
| T-63 | No content change → no event (idempotent) | Int | no false positives |

### F-17 Tracker
| T-70 | Track job → stage APPLIED → set exam date → ADMIT_CARD → RESULT | E2E | stage transitions valid |
| T-71 | User A cannot modify user B's tracker (IDOR) | E2E | 403 |

### F-20/F-21 Ads & affiliate
| T-80 | Ad slots render only at LHS/RHS/TOP/BOTTOM positions | E2E | position audit via DOM |
| T-81 | **No overlay/popup**: E2E scans every page for fixed overlays > viewport 20% | E2E | zero matches (contract test) |
| T-82 | Ad click → impression+click logged, opens in new tab | E2E | counter increments |
| T-83 | Affiliate click tracked with job context | Int | Click record w/ jobId |

### F-22 Premium
| T-90 | Razorpay checkout → webhook signature valid → entitlement granted | Int | subscription active |
| T-91 | Invalid webhook signature rejected | Int | 400, no grant |
| T-92 | Pro user sees no ad slots | E2E | slots absent |
| T-93 | Free user with 10 trackers blocked at 11th (Lite gate) | Int | 402 payment required |

### F-23 Admin
| T-100 | Admin edits a job → change logged (audit) | Int | audit row |
| T-101 | Feature flag toggles digest off/on | E2E | behavior changes instantly |

### F-24/F-25 Growth/UI
| T-110 | Sitemap + job page has schema.org JobPosting | E2E | JSON-LD valid |
| T-111 | 3D hero renders w/o WebGL → graceful fallback | E2E | no console errors |

## 4. E2E browser matrix (real browsers, not mocks)

| Browser | Runs | Scope |
|---|---|---|
| Chromium | every PR + nightly | full suite (all T-*) |
| Firefox | nightly + release | full smoke set |
| WebKit | nightly + release | full smoke set |
| Mobile emulation (iPhone SE / Pixel 7) | nightly | responsive + ad-layout audit |

## 5. CI pipeline (GitHub Actions, free)

```
push/PR → lint → typecheck → unit (backend+frontend) → integration (docker services)
        → build frontend → Playwright E2E (Chromium) → coverage report
        → nightly: full matrix (FF/WebKit/mobile) + OWASP ZAP baseline + npm audit
```

## 6. Definition of Done (every feature)

1. Code + docs updated · 2. Unit tests green · 3. Integration tests green · 4. E2E green in Chromium · 5. Security probes pass (auth/authz/SSRF for touched modules) · 6. Manual spot-check in Firefox/phone · 7. Roadmap checkbox ticked + progress report

## 7. Known limitations (accepted, logged)

- E2E uses fixture feeds (deterministic), not live govt sites — live-source reliability covered separately by source health checks (F-04).
- Email assertions run against Mailtrap API; in prod (Brevo) we add deliverability KPIs via Brevo dashboard, not E2E.
- Timezone tests assume Asia/Kolkata machine TZ for dev; engine itself is TZ-independent (UTC + TZ lib).