#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$repo_root"

deploy_target="${DEPLOY_TARGET:-root@50.116.38.56:/home/communal/web/}"
site_url="${SITE_URL:-https://communal.ar}"

echo "==> Building $repo_root ($(git rev-parse --short HEAD))"
npm run build

echo "==> Deploying to $deploy_target"
rsync -a --delete -e "ssh -o ConnectTimeout=15" ./build/ "$deploy_target"

echo "==> Deployed $(git rev-parse --short HEAD) to $site_url"
