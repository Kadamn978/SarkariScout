#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Keep-Alive Script
# Ensures services stay running even if they crash
# Add to crontab: crontab -e (add: */5 * * * * ~/keep-alive.sh)
# ============================================================

LOG="$HOME/keep-alive.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"
}

# Keep Termux awake
termux-wake-lock 2>/dev/null

# Check if sshd is running, restart if not
if ! pgrep -x sshd > /dev/null; then
    log "WARN: sshd not running, restarting..."
    sshd
    log "OK: sshd restarted"
fi

# Check Docker containers (inside proot)
PROOT_CHECK=$(proot-distro login ubuntu --shared-tmp -- bash -c "
    if ! pgrep dockerd > /dev/null 2>&1; then
        echo 'DOCKER_DOWN'
    else
        STOPPED=\$(docker ps -a --filter 'status=exited' --format '{{.Names}}' 2>/dev/null)
        if [ -n \"\$STOPPED\" ]; then
            echo \"STOPPED:\$STOPPED\"
        else
            echo 'ALL_OK'
        fi
    fi
" 2>/dev/null)

case "$PROOT_CHECK" in
    DOCKER_DOWN)
        log "WARN: Docker daemon down, restarting..."
        proot-distro login ubuntu --shared-tmp -- bash -c "dockerd &>/dev/null &"
        sleep 5
        log "OK: Docker daemon restarted"
        ;;
    STOPPED:*)
        CONTAINERS="${PROOT_CHECK#STOPPED:}"
        log "WARN: Containers stopped: $CONTAINERS. Restarting..."
        proot-distro login ubuntu --shared-tmp -- bash -c "cd /data/data/com.termux/files/home/sarkariscout/infra && docker compose -f docker-compose.phone.yml up -d"
        log "OK: Containers restarted"
        ;;
    ALL_OK)
        # Everything is fine
        ;;
esac

# Check Tailscale
if ! tailscale status &>/dev/null; then
    log "WARN: Tailscale down, restarting..."
    tailscaled &>/dev/null &
    sleep 3
    log "OK: Tailscale restarted"
fi
