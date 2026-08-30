#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# ROZGARSCOUT - Phone Server Setup Script
# Run this inside Termux on your Android phone
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_step() { echo -e "\n${CYAN}========== $1 ==========${NC}\n"; }
print_ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_err()  { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
print_step "STEP 1: Update Termux & Install Base Packages"
# ============================================================

pkg update -y && pkg upgrade -y
pkg install -y \
    curl wget git openssh htop tmux \
    build-essential python3 \
    termux-services termux-tools

print_ok "Base packages installed"

# ============================================================
print_step "STEP 2: Install Docker"
# ============================================================

# Docker is not in main repo, install via proot-distro (Ubuntu)
pkg install -y proot-distro

# Install Ubuntu (Docker needs full Linux)
proot-distro install ubuntu

print_ok "Ubuntu installed via proot-distro"

# ============================================================
print_step "STEP 3: Setup Ubuntu with Docker inside"
# ============================================================

# Create startup script for Ubuntu with Docker
cat > $PREFIX/bin/start-server << 'STARTEOF'
#!/data/data/com.termux/files/usr/bin/bash
# Start Ubuntu with shared storage
proot-distro login ubuntu --shared-tmp
STARTEOF
chmod +x $PREFIX/bin/start-server

# Create the full setup script that runs INSIDE Ubuntu
cat > /data/data/com.termux/files/home/ubuntu-setup.sh << 'SETUPEOF'
#!/bin/bash
set -e

echo "=== Setting up Ubuntu environment ==="

# Update Ubuntu
apt update && apt upgrade -y

# Install Docker
apt install -y \
    ca-certificates curl gnupg lsb-release \
    apt-transport-https software-properties-common

# Add Docker GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update

# Install Docker Engine + Compose
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker daemon
dockerd &>/dev/null &
sleep 3

# Verify Docker
docker run --rm hello-world
echo "Docker is working!"

# Install additional tools
apt install -y git curl wget htop tmux nano

echo "=== Ubuntu setup complete ==="
SETUPEOF

print_ok "Ubuntu setup script created"

# ============================================================
print_step "STEP 4: Setup SSH Server"
# ============================================================

# Setup SSH in Termux
ssh-keygen -A 2>/dev/null || true
sshd

# Get phone IP address
PHONE_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
print_ok "SSH running. Phone IP: $PHONE_IP"
print_ok "SSH port: 8022 (Termux default)"

# ============================================================
print_step "STEP 5: Setup Termux:Boot (Auto-start on boot)"
# ============================================================

BOOT_DIR="$HOME/.termux/boot"
mkdir -p "$BOOT_DIR"

cat > "$BOOT_DIR/start-services.sh" << 'BOOTEOF'
#!/data/data/com.termux/files/usr/bin/bash

# Wake lock - prevent phone from sleeping
termux-wake-lock

# Start SSH
sshd

# Keep screen on (optional, remove if not wanted)
termux-brightness 10

# Print boot message
echo "Phone server started at $(date)" >> ~/server-boot.log
BOOTEOF

chmod +x "$BOOT_DIR/start-services.sh"
print_ok "Boot auto-start configured"

# ============================================================
print_step "STEP 6: Install Tailscale (VPN for Remote Access)"
# ============================================================

echo "Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

# Enable and start Tailscale
tailscaled &>/dev/null &
sleep 2

echo -e "\n${YELLOW}ACTION REQUIRED:${NC}"
echo "Run this command to login to Tailscale:"
echo ""
echo "  tailscale up"
echo ""
echo "It will give you a URL. Open it on any device to authenticate."
echo "After that, your phone gets a permanent IP like: 100.x.x.x"

# ============================================================
print_step "STEP 7: Clone RozgarScout Repository"
# ============================================================

cd ~

# Ask for GitHub repo URL
echo -e "${YELLOW}Enter your GitHub repo URL (or press Enter to skip):${NC}"
read -r REPO_URL

if [ -n "$REPO_URL" ]; then
    git clone "$REPO_URL" rozgarscout
    print_ok "Repository cloned to ~/rozgarscout"
else
    mkdir -p rozgarscout
    print_warn "Skipped. Clone manually later with: git clone <url> ~/rozgarscout"
fi

# ============================================================
print_step "STEP 8: Create Deploy Script"
# ============================================================

cat > ~/deploy.sh << 'DEPLOYEOF'
#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=== Deploying RozgarScout ==="

cd ~/rozgarscout

# Pull latest code
git pull origin main

# Build and start containers
# You'll run Docker inside Ubuntu proot
echo "Starting Docker containers..."

# Option 1: Run inside Ubuntu proot
proot-distro login ubuntu --shared-tmp -- bash -c "
    cd /data/data/com.termux/files/home/rozgarscout/infra
    docker compose -f docker-compose.prod.yml up -d --build
"

echo "=== Deployment complete ==="
echo "API should be accessible on port 3000"
DEPLOYEOF

chmod +x ~/deploy.sh
print_ok "Deploy script created at ~/deploy.sh"

# ============================================================
print_step "STEP 9: Create Status Check Script"
# ============================================================

cat > ~/check-status.sh << 'STATUSEOF'
#!/data/data/com.termux/files/usr/bin/bash

echo "=== Phone Server Status ==="
echo ""

# Check if SSH is running
if pgrep -x sshd > /dev/null; then
    echo "[OK] SSH server running"
else
    echo "[WARN] SSH server not running. Start with: sshd"
fi

# Check Docker (inside proot)
echo ""
echo "--- Docker Containers ---"
proot-distro login ubuntu --shared-tmp -- bash -c "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'" 2>/dev/null || echo "Docker not running"

# Check Tailscale
echo ""
echo "--- Tailscale ---"
tailscale status 2>/dev/null | head -5 || echo "Tailscale not running"

# System info
echo ""
echo "--- System Info ---"
echo "Uptime: $(uptime -p 2>/dev/null || uptime)"
echo "Memory:"
free -h 2>/dev/null || cat /proc/meminfo | head -3
echo "Storage:"
df -h /data 2>/dev/null | tail -1

STATUSEOF

chmod +x ~/check-status.sh
print_ok "Status script created at ~/check-status.sh"

# ============================================================
print_step "STEP 10: Battery Optimization (IMPORTANT)"
# ============================================================

echo -e "${YELLOW}CRITICAL: Disable battery optimization for Termux${NC}"
echo ""
echo "Without this, Android will kill Termux in the background."
echo ""
echo "Steps:"
echo "1. Go to Phone Settings > Apps > Termux > Battery"
echo "2. Select 'Unrestricted' or 'Don't optimize'"
echo ""
echo "Also disable battery optimization for:"
echo "- Termux:Boot"
echo "- Tailscale"
echo ""
echo "On Samsung: Settings > Device Care > Battery > sleeping apps > exclude Termux"
echo "On Xiaomi: Settings > Battery & Performance > Manage apps battery usage > Termux > No restrictions"
echo "On OnePlus: Settings > Battery > Battery Optimization > Termux > Don't optimize"

# ============================================================
print_step "SETUP COMPLETE!"
# ============================================================

echo -e "${GREEN}Your phone server is ready!${NC}"
echo ""
echo "Quick commands:"
echo "  start-server    - Start Ubuntu with Docker"
echo "  ~/deploy.sh     - Deploy RozgarScout"
echo "  ~/check-status.sh - Check server status"
echo ""
echo "From your PC (after Tailscale is setup):"
echo "  ssh root@<tailscale-ip> -p 8022"
echo ""
echo -e "${YELLOW}Next: Run 'tailscale up' to enable remote access${NC}"
