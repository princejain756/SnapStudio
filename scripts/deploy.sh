#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_ROOT="/var/www/snapstudio.prince.sh"

cd "$ROOT"
npm run build
rsync -a --delete dist/ "$WEB_ROOT/"
echo "Deployed to $WEB_ROOT"
