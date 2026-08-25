#!/bin/bash
# =============================================================================
# SarkariScout Phone Server - Deploy Script
# =============================================================================
# Pulls latest code, applies phone-specific patches, builds, and restarts.
# Run from laptop: bash deploy.sh
# Run on phone:    bash deploy.sh --local
# =============================================================================
set -euo pipefail

PHONE_HOST="127.0.0.1"
PHONE_PORT="8022"
PHONE_USER="127.0.0.1"
REPO_DIR="$HOME/SarkariScout"
BACKEND_DIR="$REPO_DIR/backend"
LOG_DIR="$BACKEND_DIR/logs"
BRANCH="pre-dev"
APP_NAME="sarkari-backend"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Detect if running locally on phone or from laptop
REMOTE=1
if [[ "${1:-}" == "--local" ]]; then
  REMOTE=0
fi

run_cmd() {
  if [[ $REMOTE -eq 1 ]]; then
    ssh -p "$PHONE_PORT" -o ConnectTimeout=5 "$PHONE_USER@$PHONE_HOST" "$1"
  else
    eval "$1"
  fi
}

run_cmd_bg() {
  if [[ $REMOTE -eq 1 ]]; then
    ssh -f -p "$PHONE_PORT" -o ConnectTimeout=5 "$PHONE_USER@$PHONE_HOST" "$1"
  else
    eval "$1" &
  fi
}

echo "=========================================="
echo "  SarkariScout Phone Server Deploy"
echo "=========================================="

# --- Step 1: Pre-flight checks ---
info "Step 1: Pre-flight checks..."

if [[ $REMOTE -eq 1 ]]; then
  # Check SSH connectivity
  if ! ssh -p "$PHONE_PORT" -o ConnectTimeout=5 "$PHONE_USER@$PHONE_HOST" "echo ok" >/dev/null 2>&1; then
    error "Cannot SSH to phone. Is Tailscale connected and SSH running?"
  fi
  info "Phone reachable via SSH"
fi

# Check services are running
MariaDB_OK=$(run_cmd "pgrep -f mariadbd >/dev/null && echo yes || echo no" 2>/dev/null || echo no)
Redis_OK=$(run_cmd "pgrep -f redis-server >/dev/null && echo yes || echo no" 2>/dev/null || echo no)

if [[ "$MariaDB_OK" != "yes" ]]; then
  warn "MariaDB not running! Starting..."
  run_cmd "cd ~/SarkariScout && bash infra/phone-server/keep-alive.sh" 2>/dev/null || true
  sleep 2
fi
if [[ "$Redis_OK" != "yes" ]]; then
  warn "Redis not running! Starting..."
  run_cmd "redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG" 2>/dev/null || true
  sleep 1
fi

# --- Step 2: Git pull ---
info "Step 2: Pulling latest code from git (branch: $BRANCH)..."
run_cmd "cd $REPO_DIR && git fetch origin && git pull origin $BRANCH"

COMMIT_HASH=$(run_cmd "cd $REPO_DIR && git log -1 --format='%h %s'")
info "Now on commit: $COMMIT_HASH"

# --- Step 3: Apply phone-specific patches ---
info "Step 3: Applying phone-specific patches..."

# These files are phone-only modifications that MUST NOT be committed to git.
# They override shared code for Android/ARM64 compatibility.

# 3a. Replace argon2 with bcryptjs (argon2 won't compile on Android)
run_cmd "cd $BACKEND_DIR && sed -i \"s|import \* as argon2 from 'argon2';|import * as bcrypt from 'bcryptjs';|g\" src/modules/auth/auth.service.ts"
run_cmd "cd $BACKEND_DIR && sed -i \"s|const DUMMY_HASH = '\\\$argon2id\\\$v=19\\\$m=65536,t=3,p=1\\\$AAAAAAAAAAAAAAAAAAAAAA\\\$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';|const DUMMY_HASH = '\\\$2a\\\$10\\\$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';|g\" src/modules/auth/auth.service.ts"
run_cmd "cd $BACKEND_DIR && sed -i 's|argon2\.hash(dto\.password, { memoryCost: 65536, timeCost: 3 })|bcrypt.hash(dto.password, 12)|g' src/modules/auth/auth.service.ts"
run_cmd "cd $BACKEND_DIR && sed -i 's|argon2\.verify(hashToVerify, passwordToVerify)|bcrypt.compare(passwordToVerify, hashToVerify)|g' src/modules/auth/auth.service.ts"
run_cmd "cd $BACKEND_DIR && sed -i 's|argon2\.hash(newPassword, { memoryCost: 65536, timeCost: 3 })|bcrypt.hash(newPassword, 12)|g' src/modules/auth/auth.service.ts"
run_cmd "cd $BACKEND_DIR && sed -i 's|argon2\.hash(randomUUID(), { memoryCost: 65536, timeCost: 3 })|bcrypt.hash(randomUUID(), 12)|g' src/modules/auth/auth.service.ts"
run_cmd "cd $BACKEND_DIR && sed -i 's|argon2\.hash|bcrypt.hash|g' src/modules/auth/auth.service.ts 2>/dev/null || true"
run_cmd "cd $BACKEND_DIR && sed -i 's|argon2\.verify|bcrypt.compare|g' src/modules/auth/auth.service.ts 2>/dev/null || true"

# 3b. Update Prisma schema for driverAdapters (needed for ARM64)
run_cmd "cd $BACKEND_DIR && grep -q 'driverAdapters' prisma/schema.prisma || sed -i 's|provider = \"prisma-client-js\"|provider = \"prisma-client-js\"\\n  previewFeatures = [\"driverAdapters\"]|g' prisma/schema.prisma"

# 3c. Add dotenv import to main.ts (loads .env before modules)
run_cmd "cd $BACKEND_DIR && grep -q \"import 'dotenv/config'\" src/main.ts || sed -i \"1i import 'dotenv/config';\" src/main.ts"

# 3d. Update PrismaService with MariaDB adapter
run_cmd "cd $BACKEND_DIR && cat > src/prisma/prisma.service.ts << 'PRISMA_EOF'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const ADAPTER = new PrismaMariaDb({
  host: '127.0.0.1',
  port: 3306,
  user: 'sarkari',
  password: 'sarkari123',
  database: 'sarkariscout',
  connectionLimit: 5,
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // @ts-ignore — adapter is accepted at runtime by PrismaClient v6.6+
    super({ adapter: ADAPTER });
  }

  async onModuleInit() {}

  async onModuleDestroy() {
    await this.\$disconnect();
  }
}
PRISMA_EOF"

info "Patches applied"

# --- Step 4: Install dependencies ---
info "Step 4: Installing dependencies..."
run_cmd "cd $BACKEND_DIR && npm install --omit=dev 2>&1 | tail -5"

# Ensure bcryptjs is installed (not argon2)
run_cmd "cd $BACKEND_DIR && npm ls bcryptjs >/dev/null 2>&1 || npm install bcryptjs"

# Ensure Prisma adapter packages
run_cmd "cd $BACKEND_DIR && npm ls @prisma/adapter-mariadb >/dev/null 2>&1 || npm install @prisma/adapter-mariadb mariadb"
run_cmd "cd $BACKEND_DIR && npm ls mysql2 >/dev/null 2>&1 || npm install mysql2"

# --- Step 5: Regenerate Prisma client ---
info "Step 5: Regenerating Prisma client for ARM64..."
run_cmd "cd $BACKEND_DIR && rm -rf node_modules/.prisma && npx prisma generate 2>&1 | tail -3"

# --- Step 6: Stop existing backend ---
info "Step 6: Stopping existing backend..."
run_cmd "pkill -f 'node dist/src/main.js' 2>/dev/null || true"
sleep 2

# --- Step 7: Build ---
info "Step 7: Building NestJS backend..."
run_cmd "cd $BACKEND_DIR && npm run build 2>&1"
info "Build successful"

# --- Step 8: Create logs dir and start ---
info "Step 8: Starting backend..."
run_cmd "mkdir -p $LOG_DIR"
run_cmd "cd $BACKEND_DIR && > $LOG_DIR/backend.log && nohup node dist/src/main.js >> $LOG_DIR/backend.log 2>&1 &"

# Wait for startup
sleep 5

# --- Step 9: Health check ---
info "Step 9: Health check..."
HEALTH=$(run_cmd "curl -s http://127.0.0.1:3000/api/health 2>/dev/null || echo 'FAILED'" 2>/dev/null || echo "FAILED")

if echo "$HEALTH" | grep -qi "ok\|status\|healthy\|uptime"; then
  info "Backend is UP and healthy!"
  info "Health: $HEALTH"
else
  # Check if process is running
  PID_CHECK=$(run_cmd "pgrep -f 'node dist/src/main' || echo 'not running'")
  if [[ "$PID_CHECK" != "not running" ]]; then
    warn "Backend is running (PID: $PID_CHECK) but health check returned: $HEALTH"
    warn "Check logs: tail -20 $LOG_DIR/backend.log"
  else
    error "Backend failed to start! Check logs: $LOG_DIR/backend.log"
    run_cmd "tail -20 $LOG_DIR/backend.log"
    exit 1
  fi
fi

# --- Step 10: Cleanup ---
info "Step 10: Cleaning up..."

# Remove old npm cache
run_cmd "npm cache clean --force 2>/dev/null || true"

# Remove old log files (keep only last 7 days)
run_cmd "find $LOG_DIR -name '*.log.*' -mtime +7 -delete 2>/dev/null || true"

# Remove old build artifacts that might be cached
run_cmd "cd $BACKEND_DIR && rm -f tsconfig.build.tsbuildinfo 2>/dev/null || true"

# Show disk usage
DISK_INFO=$(run_cmd "df -h /data | tail -1 | awk '{print \$3\"/\"\$2\" (\"\$5\" used)\"}'" 2>/dev/null || echo "unknown")
info "Disk usage: $DISK_INFO"

echo ""
echo "=========================================="
echo "  Deploy complete!"
echo "=========================================="
echo ""
echo "  API URL (from phone):  http://127.0.0.1:3000/api"
echo "  API URL (from laptop): http://100.119.33.26:3000/api"
echo "  Logs: tail -f $LOG_DIR/backend.log"
echo ""
