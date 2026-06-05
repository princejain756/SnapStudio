#!/usr/bin/env bash
set -euo pipefail

# Run after DNS A record for snapstudio.prince.sh points to this server.
certbot --nginx -d snapstudio.prince.sh --non-interactive --agree-tos --register-unsafely-without-email --redirect
echo "SSL enabled for https://snapstudio.prince.sh"
