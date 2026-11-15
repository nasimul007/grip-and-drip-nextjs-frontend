#!/usr/bin/env bash
# One-time server setup for the storefront on the same Ubuntu 24.04 VM as the API.
#
# Run as the `ubuntu` user, from the project folder on the server (e.g. /srv/gad-frontend):
#   DOMAIN=gadgetandwidget.shop EMAIL=you@example.com ./deploy/setup.sh
#
# It installs Node 22, writes .env.production.local, installs the service and
# the nginx site, and gets the HTTPS certificate. It does NOT build the site:
# edit .env.production.local, then run ./deploy/deploy.sh.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="${DOMAIN:?set DOMAIN, e.g. gadgetandwidget.shop}"
EMAIL="${EMAIL:?set EMAIL, used by the HTTPS certificate authority for expiry notices}"
API_DOMAIN="${API_DOMAIN:-api.$DOMAIN}"
BACKEND_DIR="${BACKEND_DIR:-/srv/gad-and-wid}"

log() { printf '\n==> %s\n' "$*"; }
[[ "$(id -u)" -ne 0 ]] || { echo "Run as the ubuntu user, not root (sudo is used where needed)."; exit 1; }
[[ -d "$BACKEND_DIR/media" ]] || { echo "Backend media folder $BACKEND_DIR/media not found; set BACKEND_DIR."; exit 1; }

log "Installing packages"
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx curl

log "Installing Node.js 22 (Ubuntu's own package is too old for Next.js 16)"
if ! command -v node >/dev/null || [[ "$(node -v)" != v22.* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
node -v

if [[ ! -f "$APP_DIR/.env.production.local" ]]; then
  log "Writing $APP_DIR/.env.production.local"
  (
    umask 077
    cat > "$APP_DIR/.env.production.local" <<ENV
# Baked into the build: after changing anything here, run ./deploy/deploy.sh again.
NEXT_PUBLIC_API_URL=https://$API_DOMAIN
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_WHATSAPP=
NEXT_PUBLIC_BKASH_NUMBER=
ENV
  )
else
  echo ".env.production.local already exists, leaving it untouched."
fi

log "Making the server reach its own API directly (no round trip through the internet)"
grep -qE "[[:space:]]$API_DOMAIN(\$|[[:space:]])" /etc/hosts \
  || echo "127.0.0.1 $API_DOMAIN" | sudo tee -a /etc/hosts >/dev/null

log "Installing the service"
sed "s#__APP_DIR__#$APP_DIR#g" "$APP_DIR/deploy/gad-frontend.service" \
  | sudo tee /etc/systemd/system/gad-frontend.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable gad-frontend

log "Installing the nginx site"
sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s#__BACKEND_DIR__#$BACKEND_DIR#g" "$APP_DIR/deploy/nginx.conf" \
  | sudo tee /etc/nginx/sites-available/gad-frontend >/dev/null
sudo ln -sf /etc/nginx/sites-available/gad-frontend /etc/nginx/sites-enabled/gad-frontend
sudo nginx -t
sudo systemctl reload nginx

log "Requesting the HTTPS certificate (DNS must already point at this server, proxy off)"
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -m "$EMAIL" --agree-tos --no-eff-email --redirect --non-interactive

log "Done. Next: fill in $APP_DIR/.env.production.local (phone, email, WhatsApp, bKash), then run ./deploy/deploy.sh"
