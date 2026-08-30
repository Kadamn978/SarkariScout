$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$reportDir = Join-Path $root ".ai-inventory\quality-reports"
New-Item -ItemType Directory -Force $reportDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$report = Join-Path $reportDir "quality-$stamp.txt"

function Write-Report($text) {
    Add-Content -Path $report -Value $text
    Write-Host $text
}

function Run-Step($name, $command) {
    Write-Report "`n===== $name ====="
    Write-Report $command
    try {
        Invoke-Expression $command 2>&1 | Tee-Object -FilePath $report -Append
    } catch {
        Write-Report "STEP ERROR: $($_.Exception.Message)"
    }
}

"SAFETY: output from this script must never contain secret values." | Set-Content $report

Write-Host "`n=== RozgarScout AI Quality Baseline v2 ===" -ForegroundColor Cyan
Write-Host "READ/TEST ONLY: no git reset, clean, checkout, delete, or source-code repair.`n"

Run-Step "Git status" "git status --short"
Run-Step "Current branch" "git branch --show-current"

Run-Step "Root package validation" 'node -e "const fs=require(''fs''); JSON.parse(fs.readFileSync(''package.json'',''utf8'')); console.log(''package.json: VALID'')"'

Run-Step "Root dependency audit" "npm audit --audit-level=high"

Write-Report "`n===== Tool detection ====="

# Detect isolated Semgrep created by the repair script.
$semgrepExe = Join-Path $root ".ai-tools\semgrep\Scripts\semgrep.exe"
if (Test-Path $semgrepExe) {
    Write-Report "Semgrep: FOUND (isolated)"
    Run-Step "Semgrep SAST" "`"$semgrepExe`" --config=auto --error --exclude=.git --exclude=node_modules --exclude=.ai-tools"
} elseif (Get-Command semgrep -ErrorAction SilentlyContinue) {
    Write-Report "Semgrep: FOUND (PATH)"
    Run-Step "Semgrep SAST" "semgrep --config=auto --error --exclude=.git --exclude=node_modules --exclude=.ai-tools"
} else {
    Write-Report "Semgrep: NOT VERIFIED"
}

if (Get-Command gitleaks -ErrorAction SilentlyContinue) {
    Write-Report "Gitleaks: FOUND"
    Run-Step "Gitleaks" "gitleaks detect --source . --redact --no-banner"
} else {
    Write-Report "Gitleaks: NOT INSTALLED / NOT VERIFIED"
}

# Playwright lives under frontend.
$pwConfig = $null
if (Test-Path "frontend\playwright.config.ts") {
    $pwConfig = "frontend\playwright.config.ts"
} elseif (Test-Path "playwright.config.ts") {
    $pwConfig = "playwright.config.ts"
}

if ($pwConfig) {
    Write-Report "`n===== Playwright ====="
    Write-Report "Config: $pwConfig"
    if (Test-Path "frontend\node_modules\@playwright\test") {
        Write-Report "@playwright/test: FOUND"
    } elseif (Test-Path "node_modules\@playwright\test") {
        Write-Report "@playwright/test: FOUND at root"
    } else {
        Write-Report "@playwright/test: NOT FOUND"
    }
    Write-Report "E2E tests present:"
    if (Test-Path "frontend\e2e") {
        Get-ChildItem "frontend\e2e" -Recurse -File -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty FullName |
            ForEach-Object { Write-Report $_ }
    } elseif (Test-Path "e2e") {
        Get-ChildItem "e2e" -Recurse -File -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty FullName |
            ForEach-Object { Write-Report $_ }
    } else {
        Write-Report "NONE FOUND"
    }
} else {
    Write-Report "`n===== Playwright ====="
    Write-Report "NOT VERIFIED: no playwright.config.ts found."
}

Write-Report "`n===== Project test/build inventory ====="

if (Test-Path "backend\package.json") {
    Write-Report "--- backend/package.json scripts ---"
    node -e "const p=require('./backend/package.json'); console.log(JSON.stringify(p.scripts||{},null,2))"
}

if (Test-Path "frontend\package.json") {
    Write-Report "--- frontend/package.json scripts ---"
    node -e "const p=require('./frontend/package.json'); console.log(JSON.stringify(p.scripts||{},null,2))"
}

Write-Report "`n===== TypeScript / lint availability ====="
foreach ($cmd in @("tsc","eslint","vitest","jest","semgrep","gitleaks")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Write-Report "$cmd : PATH FOUND"
    } else {
        Write-Report "$cmd : PATH NOT FOUND"
    }
}

Write-Report "`n===== AI skills ====="
Get-ChildItem ".opencode\skills" -Directory -ErrorAction SilentlyContinue |
    Sort-Object Name |
    ForEach-Object {
        $skillFile = Join-Path $_.FullName "SKILL.md"
        if (Test-Path $skillFile) {
            Write-Report "SKILL: $($_.Name)"
        }
    }

Write-Report "`n===== Agent files ====="
if (Test-Path "agents") {
    Get-ChildItem "agents" -File -ErrorAction SilentlyContinue |
        Sort-Object Name |
        ForEach-Object { Write-Report "AGENT: $($_.Name)" }
}

Write-Report "`n===== MCP/config inventory ====="
foreach ($f in @("opencode.json",".vscode\mcp.json",".mcp.json")) {
    if (Test-Path $f) {
        Write-Report "FOUND: $f"
    } else {
        Write-Report "MISSING: $f"
    }
}

Write-Host "`n=== BASELINE COMPLETE ===" -ForegroundColor Cyan
Write-Host "REPORT: $report" -ForegroundColor Green
Write-Host "`nSTOP HERE. Review the report before installing or changing more tools."
