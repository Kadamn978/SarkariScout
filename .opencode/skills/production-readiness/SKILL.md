---
name: production-readiness
description: Perform the final production-readiness gate across functionality, tests, security, performance, accessibility, configuration, deployment and rollback evidence.
---

# Production Readiness

Never claim production-ready from static inspection alone.

## Gate
1. Build frontend and backend.
2. Run available unit/integration tests.
3. Run Playwright critical-path tests.
4. Check responsive/mobile flows.
5. Check accessibility of critical pages.
6. Run npm audit.
7. Run Semgrep when installed.
8. Run Gitleaks when installed.
9. Verify environment-variable/configuration requirements without exposing values.
10. Verify database migration/deployment procedure.
11. Verify health checks.
12. Verify rollback procedure.
13. Record anything not verifiable locally as NOT VERIFIED.

## Rules
- No secrets in output.
- No HIGH/CRITICAL security finding may be silently ignored.
- A missing tool is NOT a passing result.
- A test not executed is NOT a passing result.
- Distinguish PASS, FAIL and NOT VERIFIED.
- Prefer evidence over model judgement.
