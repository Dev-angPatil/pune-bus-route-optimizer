#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/cpp_project"
if [ ! -f "pune_route_optimizer" ]; then
    echo "[*] Building GUI application..."
    make gui
fi
./pune_route_optimizer "$@"
