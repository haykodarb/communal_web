#!/usr/bin/env bash
# Points the live site at an earlier release made by scripts/deploy.sh.
#
#   scripts/rollback.sh            # the release before the live one
#   scripts/rollback.sh <release>  # a specific one
#   scripts/rollback.sh --list     # show releases, marking the live one
set -euo pipefail

deploy_host="${DEPLOY_HOST:-root@50.116.38.56}"
deploy_dir="${DEPLOY_DIR:-/home/communal}"

ssh -o ConnectTimeout=15 "$deploy_host" bash -s -- "$deploy_dir" "${1:-}" <<'REMOTE'
set -euo pipefail
deploy_dir="$1" target="$2"
cd "$deploy_dir"

live="$(basename "$(readlink web)")"

if [ "$target" = "--list" ]; then
	ls -1 releases | sort -V -r | while read -r r; do
		[ "$r" = "$live" ] && echo "* $r (live)" || echo "  $r"
	done
	exit 0
fi

if [ -z "$target" ]; then
	target="$(ls -1 releases | sort -V -r | grep -A1 -Fx "$live" | sed -n 2p)"
	[ -n "$target" ] || { echo "No release older than $live." >&2; exit 1; }
fi

[ -d "releases/$target" ] || { echo "No release named $target." >&2; exit 1; }

ln -sfn "releases/$target" web.next
mv -T web.next web
echo "Live: $target (was $live)"
REMOTE
