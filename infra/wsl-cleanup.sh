#!/bin/bash
# Stop and remove all Docker containers
for id in $(sudo -n docker ps -aq 2>/dev/null); do
  sudo -n docker rm -f "$id" 2>/dev/null &
done
wait
echo "=== All containers removed ==="
sudo -n docker ps -a 2>/dev/null
echo "=== Docker volumes ==="
sudo -n docker volume ls 2>/dev/null
echo "=== Done ==="
