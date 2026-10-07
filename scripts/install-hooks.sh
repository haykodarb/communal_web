#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$repo_root"

git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh

echo "Installed git hooks (core.hooksPath=.githooks)."
echo "main commits and merges will now deploy to ${DEPLOY_TARGET:-root@50.116.38.56:/home/communal/web/}."
