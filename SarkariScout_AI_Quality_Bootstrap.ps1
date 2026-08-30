$ErrorActionPreference = "Stop"

# RozgarScout - minimal AI quality stack bootstrap
# Safe-by-default:
# - backs up files before changing them
# - never resets/cleans git
# - never reads/displays API keys
# - does not modify application source code
# - installs only the small set of tools that materially improve the existing setup

$Root = (Get-Location).Path
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Backup = Join-Path $Root ".ai-inventory\bootstrap-backup-$Stamp"
New-Item -ItemType Directory -Force $Backup | Out-Null

function Copy-Backup($Path) {
    if (Test-Path $Path) {
        $dest = Join-Path $Backup ((Resolve-Path $Path).Path.Substring($Root.Length).TrimStart("\"))
        $parent = Split-Path $dest -Parent
        New-Item -ItemType Directory -Force $parent | Out-Null
        Copy-Item $Path $dest -Recurse -Force
    }
}

Write-Host "`n=== RozgarScout AI Quality Bootstrap ===" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host "Backup: $Backup`n"

# Never modify these known user-work files.
$protected = @(
    "backend\prisma\seed.ts",
    "frontend\public\og-image.svg",
    "API Key Free Tire Nilesh.txt"
)

# Backup configuration/AI files we may change.
@(
    "opencode.json",
    "AGENTS.md",
    ".opencode\skills\test-engineer\SKILL.md",
    ".opencode\skills\browser-tester\SKILL.md",
    "agents\00-orchestrator.md",
    "agents\03-qa.md",
    "agents\04-security.md",
    "package.json",
    "package-lock.json"
) | ForEach-Object { Copy-Backup $_ }

# -----------------------------
# 1. Verify basic environment
# -----------------------------
Write-Host "Checking environment..." -ForegroundColor Yellow
node --version
npm --version
git --version
python --version

# -----------------------------
# 2. Add Playwright Test/CLI
# -----------------------------
# Playwright's current coding-agent workflow recommends playwright-cli for
# token-efficient browser control and Playwright Test Agents for planner,
# generator and healer workflows.
Write-Host "`nInstalling/ensuring Playwright coding-agent tooling..." -ForegroundColor Yellow

$rootPkg = Get-Content "package.json" -Raw | ConvertFrom-Json
$rootDev = @{}
if ($rootPkg.devDependencies) {
    $rootPkg.devDependencies.psobject.Properties | ForEach-Object {
        $rootDev[$_.Name] = $_.Value
    }
}

if (-not $rootDev.ContainsKey("@playwright/test")) {
    npm install -D @playwright/test@latest
}

if (-not $rootDev.ContainsKey("@playwright/cli")) {
    npm install -D @playwright/cli@latest
}

# Install browser-agent skills and generate Playwright's official OpenCode agents.
npx playwright-cli install --skills
npx playwright install chromium

if (-not (Test-Path "playwright.config.ts")) {
    npx playwright init-agents --loop=opencode
} else {
    Write-Host "playwright.config.ts already exists; not replacing it." -ForegroundColor DarkYellow
}

# -----------------------------
# 3. Minimal requirements-gap skill
# -----------------------------
$reqDir = ".opencode\skills\requirements-auditor"
New-Item -ItemType Directory -Force $reqDir | Out-Null

@'
---
name: requirements-auditor
description: Audit project requirements, documentation, architecture, existing code and tests to find missing, contradictory, incomplete, risky or unverified requirements before implementation or release.
---

# Requirements Auditor

Use this skill before major implementation and before production release.

## Workflow
1. Read the project overview and applicable docs before judging the code.
2. Inspect the actual implementation, tests, configuration and routes.
3. Build a requirement -> evidence matrix.
4. Mark each item:
   - PASS: implemented and verified
   - PARTIAL: partly implemented or insufficiently verified
   - GAP: missing
   - CONFLICT: documentation/code disagree
   - UNKNOWN: cannot verify in current environment
5. Prioritize findings:
   - P0: security, data loss, release blocker
   - P1: critical user flow/functionality
   - P2: important quality/UX/maintainability
   - P3: polish
6. Do not invent requirements. Cite the project document/file that created the requirement.
7. For each GAP, propose the smallest implementation that closes it.
8. Hand implementation to the appropriate existing specialist instead of creating a duplicate agent.
9. After implementation, re-run the affected audit and tests.

## Required output
- Requirement
- Source document
- Code evidence
- Test evidence
- Status
- Risk
- Recommended smallest fix
- Verification command
'@ | Set-Content "$reqDir\SKILL.md" -Encoding UTF8

# -----------------------------
# 4. Minimal production-readiness skill
# -----------------------------
$prodDir = ".opencode\skills\production-readiness"
New-Item -ItemType Directory -Force $prodDir | Out-Null

@'
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
'@ | Set-Content "$prodDir\SKILL.md" -Encoding UTF8

# -----------------------------
# 5. Fix the most dangerous existing test-skill inconsistency
# -----------------------------
$testSkill = ".opencode\skills\test-engineer\SKILL.md"
if (Test-Path $testSkill) {
    $txt = Get-Content $testSkill -Raw

    # Existing skill says frontend uses Vitest but example uses jest.mock.
    # Replace the misleading frontend mock example only.
    $txt = $txt -replace "jest\.mock\('\.\./contexts/AuthContext'", "vi.mock('../contexts/AuthContext'"
    $txt = $txt -replace "expect\(screen\.getByText\('RozgarScout'\)\)\.toBeDefined\(\)", "expect(screen.getByText('RozgarScout')).toBeInTheDocument()"
    $txt = $txt -replace "expect\(screen\.queryByText\('Account'\)\)\.toBeNull\(\)", "expect(screen.queryByText('Account')).not.toBeInTheDocument()"

    if ($txt -notmatch "Do not use Jest globals in Vitest") {
        $txt += @'

## Important project-specific rule
The frontend uses Vitest. Use `vi.mock`, `vi.fn`, `vi.spyOn`, etc. Do not copy Jest-only APIs into frontend tests.
'@
    }

    Set-Content $testSkill $txt -Encoding UTF8
}

# -----------------------------
# 6. Strengthen browser tester without duplicating it
# -----------------------------
$browserSkill = ".opencode\skills\browser-tester\SKILL.md"
if (Test-Path $browserSkill) {
    $txt = Get-Content $browserSkill -Raw
    if ($txt -notmatch "Release-critical browser gate") {
        $txt += @'

## Release-critical browser gate
For each critical user journey verify:
- desktop and 375px mobile viewport
- loading, success, empty and error states
- keyboard navigation for interactive controls
- accessible names/roles for important controls
- console errors
- failed network requests
- authentication/authorization boundaries
- screenshots for visual regressions
- no horizontal overflow
- no obvious layout shift

Use Playwright Test for repeatable regression. Use Playwright MCP/CLI for exploratory/manual-style investigation.
'@
        Set-Content $browserSkill $txt -Encoding UTF8
    }
}

# -----------------------------
# 7. Strengthen QA orchestration
# -----------------------------
$qaAgent = "agents\03-qa.md"
if (Test-Path $qaAgent) {
    $txt = Get-Content $qaAgent -Raw
    if ($txt -notmatch "Minimal-tool policy") {
        $txt += @'

## Minimal-tool policy

Do not create a new QA agent when an existing skill/tool can perform the job.

Use:
- Vitest/Jest for unit tests
- existing integration/API tests for service boundaries
- Playwright Test for deterministic E2E/regression
- Playwright MCP/CLI for exploratory browser testing
- Semgrep for SAST when installed
- Gitleaks for secret scanning when installed
- npm audit for dependency audit

Only introduce another tool when a concrete gap remains and the existing stack cannot cover it.
'@
        Set-Content $qaAgent $txt -Encoding UTF8
    }
}

# -----------------------------
# 8. Add one unified local quality command
# -----------------------------
$scriptsDir = "scripts"
New-Item -ItemType Directory -Force $scriptsDir | Out-Null

@'
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$reportDir = Join-Path $root ".ai-inventory\quality-reports"
New-Item -ItemType Directory -Force $reportDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$report = Join-Path $reportDir "quality-$stamp.txt"

function Run-Step($name, $command) {
    Add-Content $report "`n===== $name ====="
    Add-Content $report $command
    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    Invoke-Expression $command 2>&1 | Tee-Object -FilePath $report -Append
}

"SAFETY: output from this script must never contain secret values." | Set-Content $report

Run-Step "Git status" "git status --short"
Run-Step "Root package validation" "node -e `"const fs=require('fs'); JSON.parse(fs.readFileSync('package.json')); console.log('package.json: VALID')`""
Run-Step "Dependency audit" "npm audit --audit-level=high"

if (Get-Command semgrep -ErrorAction SilentlyContinue) {
    Run-Step "Semgrep SAST" "semgrep --config=auto --error"
} else {
    Add-Content $report "`n===== Semgrep =====`nNOT VERIFIED: semgrep is not installed."
    Write-Host "Semgrep not installed: NOT VERIFIED" -ForegroundColor DarkYellow
}

if (Get-Command gitleaks -ErrorAction SilentlyContinue) {
    Run-Step "Gitleaks" "gitleaks detect --source . --redact --no-banner"
} else {
    Add-Content $report "`n===== Gitleaks =====`nNOT VERIFIED: gitleaks is not installed."
    Write-Host "Gitleaks not installed: NOT VERIFIED" -ForegroundColor DarkYellow
}

if (Test-Path "playwright.config.ts") {
    Run-Step "Playwright regression" "npx playwright test"
} else {
    Add-Content $report "`n===== Playwright =====`nNOT VERIFIED: playwright.config.ts not found."
}

Write-Host "`nREPORT: $report" -ForegroundColor Green
'@ | Set-Content "$scriptsDir\ai-quality-check.ps1" -Encoding UTF8

# -----------------------------
# 9. Add concise project documentation
# -----------------------------
@'
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
'@ | Set-Content ".\AI-QUALITY-STACK.md" -Encoding UTF8

# -----------------------------
# 10. Optional Semgrep CE install (Windows + Python already detected)
# -----------------------------
if (-not (Get-Command semgrep -ErrorAction SilentlyContinue)) {
    Write-Host "`nSemgrep CE is not installed." -ForegroundColor DarkYellow
    Write-Host "Installing Semgrep Community Edition with Python because this machine already has Python..." -ForegroundColor Yellow
    python -m pip install --user semgrep
    if (Get-Command semgrep -ErrorAction SilentlyContinue) {
        Write-Host "Semgrep installed." -ForegroundColor Green
    } else {
        Write-Host "Semgrep installed for the Python user environment, but its Scripts directory is not currently on PATH. The quality script will report NOT VERIFIED until `semgrep` is available." -ForegroundColor DarkYellow
    }
}

# -----------------------------
# 11. Final validation
# -----------------------------
Write-Host "`n=== VALIDATION ===" -ForegroundColor Cyan

node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('package.json')); console.log('package.json: VALID')" 

if (Test-Path "playwright.config.ts") {
    Write-Host "Playwright config: FOUND" -ForegroundColor Green
} else {
    Write-Host "Playwright config: NOT FOUND" -ForegroundColor DarkYellow
}

Write-Host "New skills:"
Get-ChildItem ".opencode\skills" -Directory | Where-Object {
    $_.Name -in @("requirements-auditor","production-readiness")
} | Select-Object -ExpandProperty FullName

Write-Host "`nGit changes after bootstrap:" -ForegroundColor Cyan
git status --short

Write-Host "`n=== COMPLETE ===" -ForegroundColor Green
Write-Host "Backup: $Backup"
Write-Host "Run the quality gate later with:"
Write-Host "powershell -ExecutionPolicy Bypass -File .\scripts\ai-quality-check.ps1"
