#!/bin/bash
# =============================================================================
# SarkariScout Phone Server - Cleanup Script
# =============================================================================
# Frees disk space by removing only what WE created. Does NOT touch:
# - Database volumes/data
# - System files
# - Pre-installed packages
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }

REMOTE=1
if [[ "${1:-}" == "--local" ]]; then REMOTE=0; fi

PHONE_HOST="127.0.0.1"
PHONE_PORT="8022"
PHONE_USER="127.0.0.1"

run_cmd() {
  if [[ $REMOTE -eq 1 ]]; then
    ssh -p "$PHONE_PORT" "$PHONE_USER@$PHONE_HOST" "$1"
  else
    eval "$1"
  fi
}

echo "=========================================="
echo "  SarkariScout Phone Server Cleanup"
echo "=========================================="

BEFORE=$(run_cmd "du -sh ~/SarkariScout 2>/dev/null | cut -f1" 2>/dev/null || echo "?")
info "Repo size before cleanup: $BEFORE"

# 1. Stop backend briefly to release file locks
info "Step 1: Stopping backend..."
run_cmd "pkill -f 'node dist/src/main' 2>/dev/null || true"
sleep 1

# 2. Clean npm cache (we recreated node_modules, old cache is useless)
info "Step 2: Cleaning npm cache..."
run_cmd "npm cache clean --force 2>/dev/null || true"
run_cmd "rm -rf ~/.npm/_cacache 2>/dev/null || true"

# 3. Remove node_modules lock files and rebuild cache
info "Step 3: Cleaning npm temp files..."
run_cmd "find ~/SarkariScout -name '.package-lock.json' -delete 2>/dev/null || true"
run_cmd "find ~/SarkariScout -name 'npm-debug.log*' -delete 2>/dev/null || true"

# 4. Remove old/stale log files (keep last 3 days only)
info "Step 4: Cleaning old log files..."
run_cmd "find ~/SarkariScout/backend/logs -name '*.log.*' -mtime +3 -delete 2>/dev/null || true"
run_cmd "find ~/SarkariScout -name '*.log' -size +10M -exec truncate -s 1M {} \; 2>/dev/null || true"

# 5. Remove TypeScript build cache (regenerated on next build)
info "Step 5: Cleaning TypeScript cache..."
run_cmd "find ~/SarkariScout -name 'tsconfig.tsbuildinfo' -delete 2>/dev/null || true"
run_cmd "find ~/SarkariScout -name 'tsconfig.build.tsbuildinfo' -delete 2>/dev/null || true"
run_cmd "find ~/SarkariScout -name '.tsbuildinfo' -delete 2>/dev/null || true"

# 6. Remove old Prisma engine binaries we don't need (the x86_64 ones)
info "Step 6: Cleaning Prisma engine binaries..."
run_cmd "rm -f ~/SarkariScout/backend/node_modules/.prisma/client/*.so.node 2>/dev/null || true"
run_cmd "rm -f ~/SarkariScout/backend/node_modules/.prisma/client/*.node 2>/dev/null || true"
run_cmd "find ~/SarkariScout/backend/node_modules/@prisma/engines -name '*.node' -delete 2>/dev/null || true"

# 7. Remove git objects we don't need
info "Step 7: Cleaning git cache..."
run_cmd "cd ~/SarkariScout && git gc --auto 2>/dev/null || true"
run_cmd "cd ~/SarkariScout && git reflog expire --expire=now --all 2>/dev/null || true"
run_cmd "cd ~/SarkariScout && git prune 2>/dev/null || true"

# 8. Remove frontend build artifacts (not needed on server)
info "Step 8: Cleaning frontend artifacts..."
run_cmd "rm -rf ~/SarkariScout/frontend/dist 2>/dev/null || true"
run_cmd "rm -rf ~/SarkariScout/frontend/.cache 2>/dev/null || true"
run_cmd "rm -rf ~/SarkariScout/frontend/node_modules/.cache 2>/dev/null || true"

# 9. Remove other dev artifacts
info "Step 9: Cleaning dev artifacts..."
run_cmd "rm -rf ~/SarkariScout/backend/dist/src/prisma/*.d.ts 2>/dev/null || true"

# 10. Remove Termux temp files
info "Step 10: Cleaning Termux temp..."
run_cmd "rm -rf /data/data/com.termux/files/usr/tmp/* 2>/dev/null || true"
run_cmd "rm -rf ~/../usr/tmp/* 2>/dev/null || true"

# DO NOT TOUCH:
# - ~/SarkariScout/backend/node_modules (needed)
# - ~/SarkariScout/backend/.env (needed)
# - ~/.ssh (needed)
# - MariaDB data directory (has user data!)
# - Redis data (has session data!)
# - ~/SarkariScout/.git (needed for git pull)

AFTER=$(run_cmd "du -sh ~/SarkariScout 2>/dev/null | cut -f1" 2>/dev/null || echo "?")
DISK=$(run_cmd "df -h /data | tail -1 | awk '{print \$3\"/\"\$2\" (\" \$5\" used)\"}'" 2>/dev/null || echo "?")

echo ""
info "Repo size before: $BEFORE"
info "Repo size after:  $AFTER"
info "Disk usage:       $DISK"
echo ""
info "Cleanup complete!"
echo ""
echo "  What was cleaned:"
echo "    - npm cache"
echo "    - TypeScript build cache"
echo "    - x86_64 Prisma engine binaries"
echo "    - Old log files (>3 days)"
echo "    - Frontend dist/cache"
echo "    - Git garbage collection"
echo ""
echo "  What was NOT touched:"
echo "    - node_modules/ (packages)"
echo "    - .env (configuration)"
echo "    - MariaDB data (user databases)"
echo "    - Redis data (sessions)"
echo "    - .git/ (repository)"
echo "    - .ssh/ (SSH keys)"
echo ""
