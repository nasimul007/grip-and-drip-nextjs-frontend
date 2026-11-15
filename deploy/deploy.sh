#!/usr/bin/env bash
# Run on the server after copying new code (and after setup.sh the first time):
# installs dependencies, builds the site and restarts it.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

[[ -f .env.production.local ]] || { echo ".env.production.local is missing; run deploy/setup.sh first."; exit 1; }

npm ci
# The build needs more memory than the running site.
NODE_OPTIONS=--max-old-space-size=3072 npm run build
sudo systemctl restart gad-frontend
sleep 3
sudo systemctl is-active --quiet gad-frontend && echo "gad-frontend is running"
