# Phone Server Setup Guide

## Step 1: Install Apps on Phone (from F-Droid, NOT Play Store)

| App | Purpose | Download |
|-----|---------|----------|
| **Termux** | Linux terminal environment | F-Droid: https://f-droid.org/en/packages/com.termux/ |
| **Termux:Boot** | Auto-start services on boot | F-Droid: https://f-droid.org/en/packages/com.termux.boot/ |
| **Termux:API** | Access phone features (optional) | F-Droid: https://f-droid.org/en/packages/com.termux.api/ |
| **Tailscale** | VPN for remote SSH access | Play Store or https://tailscale.com/download |

> **IMPORTANT:** Install Termux from **F-Droid** (v0.118.0+). The Play Store version is outdated and will cause errors.

## Step 2: Phone Setup (run these in Termux)

```bash
# Download and run the setup script
curl -sL https://raw.githubusercontent.com/your-repo/phone-server-setup.sh | bash
```

Or copy `phone-setup.sh` to your phone and run:
```bash
bash phone-setup.sh
```

## Step 3: PC Connection

Install Tailscale on your PC, join same network, then:
```bash
ssh root@<phone-tailscale-ip>
```

## Step 4: Deploy

From PC or phone:
```bash
cd ~/rozgarscout
./deploy.sh
```
