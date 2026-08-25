# Phone Server Troubleshooting Guide

## Issues We Actually Hit (and how we fixed them)

### 1. Docker DOES NOT WORK in proot-distro
**Error:** `iptables failed: Permission denied`
**Error:** `error initializing buildkit: stat /proc/.../ns/pid: no such file or directory`

**Root cause:** Android doesn't give proot the kernel access Docker needs (iptables, cgroups, namespaces).

**Solution:** We DO NOT use Docker. Instead install services natively in Termux:
```bash
pkg install nodejs-lts mariadb redis git make clang -y
```

### 2. argon2 native module fails to compile
**Error:** `implicit instantiation of undefined template 'std::char_traits<unsigned char>'`

**Root cause:** C++ compatibility issue between Node.js 24 and Termux's clang/libc++.

**Solution:** Use bcryptjs (pure JS) instead:
```bash
cd ~/SarkariScout/backend
npm uninstall argon2
npm install bcryptjs --legacy-peer-deps
```
Then update the code to use bcryptjs instead of argon2.

### 3. npm "Invalid Version" error
**Root cause:** Corrupted package-lock.json or node_modules.

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 4. SSH connection timed out / connection reset
**Root cause:** Android killed Termux or Tailscale in background.

**Fix sequence:**
1. Wake up phone (power button)
2. Open Tailscale app → verify "Connected"
3. Open Termux → run `sshd && termux-wake-lock`
4. From laptop: `ssh -p 8022 127.0.0.1@<phone-ip>`

**Prevention:**
- Settings > Apps > Termux > Battery > **Unrestricted**
- Settings > Apps > Tailscale > Battery > **Unrestricted**
- Run `termux-wake-lock` every time you open Termux

### 5. Redis kernel warning
**Warning:** `Your kernel has a bug that could lead to data corruption during background save`

**Fix:** Start Redis with the ignore flag:
```bash
redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG
```

### 6. MariaDB won't start
**Fix:**
```bash
mariadbd-safe --datadir=$PREFIX/var/lib/mysql &
sleep 2
mariadb -u root -e "SELECT 1"
```

### 7. Boot auto-start not working
**Check:**
```bash
ls -la ~/.termux/boot/
```
**Fix:**
- Make sure Termux:Boot app is installed
- Open Termux:Boot app once to initialize
- Ensure script is executable: `chmod +x ~/.termux/boot/*.sh`

## Quick Diagnostic (paste in Termux)

```bash
echo "=== SSHD ===" && (pgrep sshd > /dev/null && echo "OK" || echo "DOWN - run: sshd") && echo "=== MariaDB ===" && (pgrep mariadbd > /dev/null && echo "OK" || echo "DOWN - run: mariadbd-safe --datadir=$PREFIX/var/lib/mysql &") && echo "=== Redis ===" && (pgrep redis-server > /dev/null && echo "OK" || echo "DOWN - run: redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG") && echo "=== Tailscale ===" && (tailscale status 2>/dev/null | head -1 || echo "DOWN - open Tailscale app") && echo "=== Memory ===" && free -h | head -2 && echo "=== Storage ===" && df -h /data | tail -1
```

## Full Restart (paste as ONE block after phone wakes up)

```bash
termux-wake-lock
sshd
mariadbd-safe --datadir=$PREFIX/var/lib/mysql &
sleep 2
redis-server --daemonize yes --ignore-warnings ARM64-COW-BUG
echo "=== All services started ==="
pgrep sshd && echo "SSHD: OK" || echo "SSHD: FAILED"
pgrep mariadbd && echo "MariaDB: OK" || echo "MariaDB: FAILED"
pgrep redis-server && echo "Redis: OK" || echo "Redis: FAILED"
```

## Performance Tips

1. **Screen off:** Always keep screen off when running as server (saves ~2W power)
2. **Charging:** Keep phone plugged in 24/7 for permanent server use
3. **Clean cache:** `pkg clean` monthly
4. **Monitor memory:** `free -h` — if below 500MB free, restart services
5. **Auto-restart:** Set up cron job with keep-alive.sh

## Phone Server Status (from laptop)

```powershell
# Check if phone is reachable
ping 100.119.33.26

# SSH into phone
ssh -p 8022 127.0.0.1@100.119.33.26

# Check services remotely
ssh -p 8022 127.0.0.1@100.119.33.26 "pgrep sshd && pgrep mariadbd && pgrep redis-server"
```
