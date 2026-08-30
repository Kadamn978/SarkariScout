# RozgarScout AI QA Repair v2
# Safe repair: no git reset/clean/checkout and no application-source edits.
$ErrorActionPreference = "Stop"
$Root = (Get-Location).Path

if (!(Test-Path ".opencode") -or !(Test-Path "AGENTS.md") -or !(Test-Path "package.json")) {
  throw "Run this from the RozgarScout repository root."
}

Write-Host "`n=== RozgarScout AI QA Repair v2 ===" -ForegroundColor Cyan
Write-Host "No git reset/clean/checkout will be performed.`n"

Write-Host "--- Current Git state ---" -ForegroundColor Yellow
git status --short
Write-Host "Branch: $(git branch --show-current)"

Write-Host "`n--- Isolated Semgrep environment ---" -ForegroundColor Yellow
$venv = Join-Path $Root ".ai-tools\semgrep"
$py = Join-Path $venv "Scripts\python.exe"
if (!(Test-Path $py)) {
  if (Get-Command py -ErrorAction SilentlyContinue) { py -3 -m venv $venv }
  elseif (Get-Command python -ErrorAction SilentlyContinue) { python -m venv $venv }
  else { throw "Python was not found." }
}
& $py -m pip install --upgrade pip --quiet
& $py -m pip install semgrep --quiet
Write-Host "Semgrep isolated successfully: $venv" -ForegroundColor Green
& $py -m semgrep --version

Write-Host "`n--- Existing global Python environment (READ ONLY) ---" -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
  python -c "import sys; print(sys.executable)"
  # pip check can emit warnings to stderr; do not abort the repair because of
  # pre-existing global-environment issues. We intentionally do not modify it.
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  python -m pip check 2>&1 | Select-Object -First 25
  $ErrorActionPreference = $old
  Write-Host "Global Python packages were NOT changed." -ForegroundColor DarkYellow
}

Write-Host "`n--- Playwright ---" -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
  Push-Location frontend
  try {
    $pkg = Get-Content package.json -Raw | ConvertFrom-Json
    $has = (($pkg.devDependencies.PSObject.Properties.Name -contains "@playwright/test") -or
            ($pkg.dependencies.PSObject.Properties.Name -contains "@playwright/test"))
    if (!$has) {
      npm install -D @playwright/test
    } else {
      Write-Host "@playwright/test already installed."
    }
    npx playwright install chromium
  } finally {
    Pop-Location
  }
} else {
  Write-Host "frontend/package.json not found; skipped." -ForegroundColor DarkYellow
}

if (!(Test-Path "frontend\playwright.config.ts") -and !(Test-Path "playwright.config.ts")) {
@'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
'@ | Set-Content -Encoding UTF8 "frontend\playwright.config.ts"
  Write-Host "Created frontend/playwright.config.ts" -ForegroundColor Green
} else {
  Write-Host "Playwright config already exists."
}

Write-Host "`n--- AI assets ---" -ForegroundColor Yellow
@(
".opencode\skills\requirements-auditor\SKILL.md",
".opencode\skills\production-readiness\SKILL.md",
".opencode\skills\browser-tester\SKILL.md",
".opencode\skills\test-engineer\SKILL.md"
) | ForEach-Object {
  if (Test-Path $_) { Write-Host "OK   $_" -ForegroundColor Green }
  else { Write-Host "MISS $_" -ForegroundColor Red }
}

Write-Host "`n--- Config validation ---" -ForegroundColor Yellow
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('package.json','utf8')); JSON.parse(fs.readFileSync('opencode.json','utf8')); console.log('package.json + opencode.json: VALID')"

Write-Host "`n=== REPAIR COMPLETE ===" -ForegroundColor Cyan
git status --short
Write-Host "`nSTOP HERE. Send the complete output to ChatGPT before running ai-quality-check.ps1."
