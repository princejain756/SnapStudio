#!/usr/bin/env bash
set -euo pipefail

TARGET_IP="31.97.202.108"
DOMAIN="snapstudio.prince.sh"

echo "Checking DNS for $DOMAIN..."
RESOLVED=$(dig @8.8.8.8 +short "$DOMAIN" A | head -1)

if [[ "$RESOLVED" != "$TARGET_IP" ]]; then
  echo "DNS not ready yet. Resolved: ${RESOLVED:-none}, expected: $TARGET_IP"
  echo "Add an A record: snapstudio -> $TARGET_IP in your DNS panel, then re-run this script."
  exit 1
fi

echo "DNS OK ($RESOLVED). Requesting SSL certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
echo "Done: https://$DOMAIN"
