#!/usr/bin/env bash
# Builds the app and deploys it as a new release on the server.
#
# Each build goes to its own folder under $DEPLOY_DIR/releases, and the web root
# ($DEPLOY_DIR/web, which nginx serves) is a symlink that is switched to it in a
# single rename, so visitors never see a half-uploaded site. The newest
# $KEEP_RELEASES releases are kept; scripts/rollback.sh switches back to one.
#
# Nothing is deployed unless package.json's version differs from the live
# release's; pass --force to deploy anyway.
set -euo pipefail

repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$repo_root"

deploy_host="${DEPLOY_HOST:-root@50.116.38.56}"
deploy_dir="${DEPLOY_DIR:-/home/communal}"
keep_releases="${KEEP_RELEASES:-5}"
site_url="${SITE_URL:-https://communal.ar}"

force=false
[ "${1:-}" = "--force" ] && force=true

ssh_opts=(-o ConnectTimeout=15)

rev="$(git rev-parse --short HEAD)"
[ -z "$(git status --porcelain)" ] || rev="$rev-dirty"
version="$(node -p 'require("./package.json").version')"

# Releases are named v<version>, so the live version is read off the symlink.
# A forced redeploy of the live version adds the time (semver build metadata),
# since uploading into the live folder would defeat the atomic switch.
live_release="$(ssh "${ssh_opts[@]}" "$deploy_host" "readlink '$deploy_dir/web' || true")"
live_release="$(basename "$live_release")"
live_version=""
case "$live_release" in v[0-9]*) live_version="${live_release#v}" live_version="${live_version%%+*}" ;; esac

release="v$version"
if [ "$version" = "$live_version" ]; then
	if ! $force; then
		echo "==> Version $version is already live; not deploying."
		echo "    Bump \"version\" in package.json, or run scripts/deploy.sh --force."
		exit 0
	fi
	release="v$version+$(date -u +%Y%m%d-%H%M%S)"
fi

echo "==> Checking $repo_root ($rev, version ${live_version:-unknown} -> $version)"
if ! npm run check; then
	echo "!! Type check failed; nothing was deployed." >&2
	exit 1
fi

echo "==> Building"
npm run build

echo "==> Uploading release $release to $deploy_host"
ssh "${ssh_opts[@]}" "$deploy_host" "mkdir -p '$deploy_dir/releases'"
# Files unchanged since the live release are hard-linked instead of copied.
# --delete matters when this version was deployed before and rolled back.
rsync -a --delete -e "ssh ${ssh_opts[*]}" --link-dest="$deploy_dir/web/" \
	./build/ "$deploy_host:$deploy_dir/releases/$release/"

echo "==> Switching $deploy_dir/web to $release"
ssh "${ssh_opts[@]}" "$deploy_host" bash -s -- "$deploy_dir" "$release" "$keep_releases" <<'REMOTE'
set -euo pipefail
deploy_dir="$1" release="$2" keep="$3"
cd "$deploy_dir"

# One-time migration: the web root used to be a plain directory.
if [ -d web ] && [ ! -L web ]; then
	legacy="v0-legacy"
	mv web "releases/$legacy"
	echo "    moved the old web directory to releases/$legacy"
fi

ln -sfn "releases/$release" web.next
mv -T web.next web

# Prune old releases, never the live one.
live="$(readlink web)"
ls -1 releases | sort -V -r | tail -n +"$((keep + 1))" | while read -r old; do
	[ "releases/$old" = "$live" ] || rm -rf "releases/$old"
done
REMOTE

echo "==> Deployed $release ($rev) to $site_url"
