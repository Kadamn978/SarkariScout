#!/bin/bash
# ============================================================
# SARKARISCOUT - PC Connection Setup
# Run this on your Windows PC / laptop
# ============================================================

set -e

echo "========================================="
echo "  Phone Server - PC Connection Setup"
echo "========================================="
echo ""

# Check if Tailscale is installed
if command -v tailscale &> /dev/null; then
    echo "[OK] Tailscale is installed"
else
    echo "[INFO] Installing Tailscale..."
    echo "Download from: https://tailscale.com/download/windows"
    echo "Or run in PowerShell (as Admin):"
    echo "  winget install Tailscale.Tailscale"
    echo ""
    echo "After install, login and come back."
    exit 1
fi

# Get Tailscale IP
TS_IP=$(tailscale ip -4 2>/dev/null)
if [ -z "$TS_IP" ]; then
    echo "[WARN] Tailscale not connected. Run: tailscale up"
    exit 1
fi

echo "[OK] Your Tailscale IP: $TS_IP"
echo ""

# Test connection to phone
echo "Enter your phone's Tailscale IP (format: 100.x.x.x):"
read -r PHONE_IP

if [ -z "$PHONE_IP" ]; then
    echo "Phone IP is required."
    exit 1
fi

echo ""
echo "Testing connection to phone at $PHONE_IP ..."

# Test ping
if ping -c 2 "$PHONE_IP" &> /dev/null; then
    echo "[OK] Phone is reachable"
else
    echo "[WARN] Cannot ping phone. Make sure Tailscale is running on phone too."
fi

# Test SSH
echo ""
echo "Testing SSH connection..."
echo "Use password: (your Termux SSH password, or setup key-based auth)"
echo ""

ssh -p 8022 -o ConnectTimeout=5 "127.0.0.1@$PHONE_IP" "echo 'SSH connection successful!'" 2>/dev/null && \
    echo "[OK] SSH works!" || \
    echo "[INFO] SSH not ready yet. Make sure sshd is running on phone."

echo ""
echo "========================================="
echo "  Connection Details"
echo "========================================="
echo ""
echo "Phone Tailscale IP: $PHONE_IP"
echo "SSH Port:           8022"
echo "SSH Command:        ssh -p 8022 127.0.0.1@$PHONE_IP"
echo ""
echo "To copy files to phone:"
echo "  scp -P 8022 <file> 127.0.0.1@$PHONE_IP:~/"
echo ""
echo "To deploy from PC:"
echo "  scp -P 8022 -r ../infra/phone-server/ 127.0.0.1@$PHONE_IP:~/setup/"
echo "  ssh -p 8022 127.0.0.1@$PHONE_IP 'bash ~/setup/deploy.sh'"
echo ""

# Save connection details
cat > phone-server-config.env << EOF
PHONE_IP=$PHONE_IP
SSH_PORT=8022
SSH_CMD="ssh -p 8022 127.0.0.1@$PHONE_IP"
EOF

echo "[OK] Config saved to phone-server-config.env"
