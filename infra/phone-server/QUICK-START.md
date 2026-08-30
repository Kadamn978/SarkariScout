# Phone Server - Quick Start Checklist

## Prerequisites
- Old Android phone (6GB RAM, 128GB ROM)
- F-Droid app store installed on phone
- Tailscale app installed on phone (Play Store)

## Phase 1: Install Apps on Phone

Install from **F-Droid** (NOT Play Store):
- **Termux** (v0.118+)
- **Termux:Boot**
- **Termux:API**

Install from **Play Store**:
- **Tailscale**

## Phase 2: Disable Battery Optimization (DO THIS FIRST!)

Go to phone Settings:
1. **Settings > Apps > Termux > Battery** → "Unrestricted"
2. **Settings > Apps > Termux:Boot** → "Unrestricted"
3. **Settings > Apps > Tailscale** → "Unrestricted"

> Without this, Android kills Termux after ~30 min in background.

## Phase 3: Phone Setup (paste these as ONE block in Termux)

```bash
pkg update -y && pkg upgrade -y && pkg install openssh nodejs-lts mariadb redis git make clang -y && ssh-keygen -A && sshd && termux-wake-lock && echo "=== Setup complete ===" && echo "Phone IP:" && ip route get 1 | awk '{print $7; exit}'
```

## Phase 4: Setup Tailscale on Phone

1. Open **Tailscale app** on phone → tap "Get Started" → log in with same account as laptop
2. Note the phone's Tailscale IP shown in the app (format: `100.x.x.x`)

## Phase 5: Connect from Laptop

In PowerShell on laptop:
```powershell
ssh -p 8022 127.0.0.1@<phone-tailscale-ip>
```
Enter the password you set on the phone when prompted.

## Phase 6: Deploy RozgarScout (paste as ONE block in SSH session)

```bash
mariadbd-safe --datadir=$PREFIX/var/lib/mysql &
sleep 2
redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG
mariadb -u root -e "CREATE DATABASE IF NOT EXISTS rozgarscout; CREATE USER IF NOT EXISTS 'sarkari' IDENTIFIED BY 'sarkari123'; GRANT ALL ON rozgarscout.* TO 'sarkari'; FLUSH PRIVILEGES;"
cd ~ && git clone https://github.com/Kadamn978/RozgarScout.git && cd RozgarScout && git checkout pre-dev
echo "=== Services started, repo cloned ==="
```

## Phase 7: Install Backend Dependencies

```bash
cd ~/RozgarScout/backend
export CXXFLAGS="-std=c++17"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

> Note: `argon2` native module may fail to compile on Android. If it fails,
> we use bcryptjs as a fallback (see TROUBLESHOOTING.md).

## Phase 8: Setup Environment & Run

```bash
cp .env.example .env 2>/dev/null || echo "DATABASE_URL=mysql://sarkari:sarkari123@127.0.0.1:3306/rozgarscout
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your-secret-key-change-this
PORT=3000" > .env
npx prisma generate
npx prisma db push
npm run start:prod &
```

## Phase 9: Auto-Start on Boot (on phone)

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/start.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
sshd
mariadbd-safe --datadir=$PREFIX/var/lib/mysql &
redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG &
EOF
chmod +x ~/.termux/boot/start.sh
```

## Phase 10: Keep Alive Cron Job

```bash
cat > ~/keep-alive.sh << 'KEEPEOF'
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
pgrep sshd || sshd
pgrep mariadbd || mariadbd-safe --datadir=$PREFIX/var/lib/mysql &
pgrep redis-server || redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG
KEEPEOF
chmod +x ~/keep-alive.sh
crontab -e
# Add: */5 * * * * ~/keep-alive.sh
```

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Start SSH | `sshd` |
| Start MariaDB | `mariadbd-safe --datadir=$PREFIX/var/lib/mysql &` |
| Start Redis | `redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG` |
| Check services | `pgrep sshd && pgrep mariadbd && pgrep redis-server` |
| Stop all | `kill $(pgrep sshd) $(pgrep mariadbd) $(pgrep redis-server)` |
| Connect from PC | `ssh -p 8022 127.0.0.1@100.x.x.x` |
| Reconnect after sleep | Wake phone → open Termux → `sshd` → reconnect from PC |

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues.
