# Parallel Development Rules (Windows + Termux)

**Problem:** Two sessions editing same files = merge conflicts, broken code.

## Golden Rules

### 1. ALWAYS Pull Before Starting
```bash
git pull origin pre-dev
```
Run this FIRST in every session before writing any code.

### 2. ALWAYS Pull Before Pushing
```bash
git pull origin pre-dev --no-edit
```
If conflicts happen, resolve them, THEN push.

### 3. Avoid Same Files
- **Windows session:** Focus on backend, analytics, backups, infrastructure
- **Termux session:** Focus on frontend pages, components, UI polish
- If you MUST edit the same file, coordinate via WhatsApp/Telegram first

### 4. Small Frequent Commits
Don't work for hours without committing. Commit every 15-30 minutes.
Other session can pull smaller changes instead of huge merges.

### 5. Use the Safe Push Script
Run `safe-push.bat` (Windows) or `safe-push.sh` (Termux) instead of manual git commands.
It auto-pulls, checks conflicts, then pushes.

## Quick Reference

| Action | Command |
|--------|---------|
| Start work | `git pull origin pre-dev` |
| Check status | `git status` |
| Before push | `git pull origin pre-dev --no-edit` |
| If conflict | Fix files → `git add .` → `git commit` → `git push` |
| Safe push | Run `safe-push.bat` or `safe-push.sh` |

## Conflict Resolution
1. `git pull` → shows conflict files
2. Open conflicted files, look for `<<<<<<<` markers
3. Choose which version to keep
4. Remove conflict markers
5. `git add .` → `git commit` → `git push`
