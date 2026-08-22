# Mistake Log & Self-Learning Rules

**Purpose:** Prevent repeating the same mistakes. Read this file at the START of every session.

---

## Rules

1. Before starting work, read this file
2. If you make a mistake, log it immediately with: what happened, why, and the fix
3. Before repeating a pattern, check if it's already logged as a mistake
4. Never assume — verify (file exists, package installed, Node version compatible)
5. If unsure, ask — don't guess and create rework

---

## Mistake Log

### M001 — Wrong Vite template scaffolded
- **Date:** 2026-08-22
- **What:** Used `npm create vite` with wrong syntax, got vanilla TS instead of React
- **Why:** PowerShell flag parsing issue with `--template` argument
- **Fix:** Use `npx create-vite@latest frontend --template react-ts` directly
- **Rule:** Always verify scaffold output before proceeding (check for `.tsx` files)

### M002 — Node version incompatibility with Vite 8
- **Date:** 2026-08-22
- **What:** Vite 8.x requires Node ^20.19.0 || >=22.12.0, system has 22.11.0
- **Why:** Didn't check Node version before installing latest Vite
- **Fix:** Downgraded to Vite 6.x which supports Node 22.11
- **Rule:** Always check `node -v` and match dependency versions accordingly

### M003 — npm install timeout
- **Date:** 2026-08-22
- **What:** `npm install` timed out at 120s multiple times
- **Why:** Slow network / large dependency tree
- **Fix:** Use 180s timeout for npm commands
- **Rule:** Set timeout to 180000 for any npm install command

### M004 — Name "SarkariRadar" was already taken
- **Date:** 2026-08-22
- **What:** Chose a name without checking if it exists
- **Why:** Didn't search Google before committing to name
- **Fix:** Renamed to "SarkariScout" across all files
- **Rule:** ALWAYS search Google for the exact name before using it. Check for existing sites, trademarks, social media handles.

### M005 — JSON parse error on large file writes
- **Date:** 2026-08-22
- **What:** Writing large TSX files caused JSON parse errors in tool
- **Why:** Content too long for single write call
- **Fix:** Split large files into smaller writes or use bash to write
- **Rule:** If file content > 200 lines, split into multiple write calls

### M006 — Not adding .env to gitignore
- **Date:** 2026-08-22
- **What:** .env file could be committed with secrets
- **Why:** Didn't check existing .gitignore before creating env files
- **Rule:** Always add .env patterns to .gitignore BEFORE creating .env files

### M007 — rg (ripgrep) not installed on Windows
- **Date:** 2026-08-22
- **What:** Used `rg` command which doesn't exist on this system
- **Why:** Assumed ripgrep was available
- **Fix:** Use PowerShell `Get-ChildItem` or grep tool instead
- **Rule:** On Windows, use `findstr` or the grep tool, not `rg`

---

## Pre-Session Checklist

Before starting any work, verify:
- [ ] Node version: `node -v`
- [ ] Current branch: `git branch --show-current`
- [ ] Read this MISTAKES.md file
- [ ] Check `.gitignore` before creating env/config files
- [ ] Search Google for any new names/brands before using them
