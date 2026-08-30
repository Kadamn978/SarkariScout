# AI Quality Stack

This project intentionally uses a small number of tools and specialists.

## Existing specialists retained
- Orchestrator
- Architect
- Developer
- QA
- Security
- DevOps
- code-reviewer
- backend-optimizer
- db-optimizer
- performance-tuner
- ui-ux-reviewer
- security-auditor
- test-engineer
- browser-tester

## Added
- `requirements-auditor` skill
- `production-readiness` skill
- Playwright Test
- Playwright CLI
- official Playwright planner/generator/healer agents
- `scripts/ai-quality-check.ps1`

## Browser strategy
- Playwright Test = deterministic regression/E2E
- Playwright CLI = token-efficient coding-agent browser control
- Playwright MCP = exploratory/agentic browser control

## Security strategy
- npm audit = dependency audit
- Semgrep CE = SAST when installed
- Gitleaks = secret scanning when installed

A missing tool is reported as NOT VERIFIED, never as PASS.
