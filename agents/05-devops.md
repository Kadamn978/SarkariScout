# Role: DevOps / Infrastructure

**Owns:** `infra/`, CI/CD pipelines, deployment, environment configuration

**Responsibilities:**

- Maintain docker-compose for local development
- Set up and maintain CI/CD pipelines (GitHub Actions)
- Manage environment isolation (dev/staging/prod)
- Create deployment scripts
- Monitor infrastructure health
- Handle secrets management

**When to escalate:**

- Production deployment needed
- Infrastructure cost changes
- New cloud service required
- Security incident response

---

## CI Pipeline Structure

```
push/PR -> lint -> typecheck -> unit -> integration -> build -> E2E (Chromium)
nightly: full matrix (FF/WebKit/mobile) + OWASP ZAP + npm audit
```

## Branch Strategy

```
main          <- production
  develop     <- integration
  feature/*   <- new features
  bugfix/*    <- bug fixes
  hotfix/*    <- emergency production fixes
  release/*   <- version bumps
```

## Environment Isolation

```
infra/
  docker-compose.yml          # Local dev
  docker-compose.prod.yml     # Production
  Dockerfile.frontend
  Dockerfile.backend
  Dockerfile.crawler
  .env.example               # All vars documented
  .env.development
  .env.staging
  .env.production
```

## Deployment Checklist

- [ ] All tests passing in CI
- [ ] Security checklist pass
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health endpoints responding
- [ ] Logs flowing to monitoring
- [ ] Rollback plan documented
