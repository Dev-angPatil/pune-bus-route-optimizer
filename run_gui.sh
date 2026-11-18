#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ ! -f "pune_route_optimizer" ]; then
    echo "[*] Building Desktop GUI application..."
    make gui
fi
./pune_route_optimizer "$@"
