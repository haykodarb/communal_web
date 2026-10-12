#!/usr/bin/env bash
# Uploads the Android app so communal.ar/communal.apk serves it.
#
#   scripts/publish-apk.sh            # ../communal_app's release build
#   scripts/publish-apk.sh <apk>      # or a specific file
#
# The APK lives in $DEPLOY_DIR/downloads, outside the site's releases, so it
# isn't re-uploaded with every web deploy; scripts/deploy.sh links each release
# to it. It's uploaded under a temporary name and renamed into place, so a
# download in progress never gets half of one build and half of another.
set -euo pipefail

repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

deploy_host="${DEPLOY_HOST:-root@50.116.38.56}"
deploy_dir="${DEPLOY_DIR:-/home/communal}"
site_url="${SITE_URL:-https://communal.ar}"

apk="${1:-$repo_root/../communal_app/build/app/outputs/flutter-apk/app-release.apk}"
[ -f "$apk" ] || { echo "!! No APK at $apk" >&2; exit 1; }

ssh_opts=(-o ConnectTimeout=15)

echo "==> Uploading $apk ($(du -h "$apk" | cut -f1)) to $deploy_host"
ssh "${ssh_opts[@]}" "$deploy_host" "mkdir -p '$deploy_dir/downloads'"
rsync -t --chmod=F644 -e "ssh ${ssh_opts[*]}" "$apk" "$deploy_host:$deploy_dir/downloads/communal.apk.next"

# Releases deployed before the APK was hosted here get the link too.
ssh "${ssh_opts[@]}" "$deploy_host" bash -s -- "$deploy_dir" <<'REMOTE'
set -euo pipefail
cd "$1"
mv -f downloads/communal.apk.next downloads/communal.apk
for r in releases/*/; do
	ln -sfn ../../downloads/communal.apk "${r}communal.apk"
done
REMOTE

echo "==> Published $site_url/communal.apk"
