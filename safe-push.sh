#!/bin/bash
# safe-push.sh — Pull before push, handle conflicts safely
# Run this instead of manual git push

echo ""
echo "=== RozgarScout Safe Push ==="
echo ""

echo "[1/4] Checking for uncommitted changes..."
git status --short
echo ""

echo "[2/4] Pulling latest from origin/pre-dev..."
git pull origin pre-dev --no-edit
if [ $? -ne 0 ]; then
    echo ""
    echo "[!] Pull failed. Resolve conflicts first."
    echo "    1. Open conflicted files"
    echo "    2. Fix <<<<<<< markers"
    echo "    3. Run: git add ."
    echo "    4. Run: git commit"
    echo "    5. Run this script again"
    exit 1
fi

echo ""
echo "[3/4] Staging all changes..."
git add .

echo ""
echo "[4/4] Committing and pushing..."
git status --short
echo ""
read -p "Enter commit message: " MSG
if [ -z "$MSG" ]; then
    MSG="update: parallel session changes"
fi
git commit -m "$MSG"
git push origin pre-dev

if [ $? -eq 0 ]; then
    echo ""
    echo "[OK] Pushed successfully!"
else
    echo ""
    echo "[!] Push failed. Try again."
fi
