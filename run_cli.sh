#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/cpp_project"
if [ ! -f "pune_route_cli" ]; then
    echo "[*] Building CLI application..."
    make cli
fi
./pune_route_cli "$@"
