#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${HOSTINGER_FTP_HOST:-}" || -z "${HOSTINGER_FTP_USER:-}" || -z "${HOSTINGER_FTP_PASSWORD:-}" ]]; then
  echo "Set HOSTINGER_FTP_HOST, HOSTINGER_FTP_USER, and HOSTINGER_FTP_PASSWORD."
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm ci
npm run build

REMOTE_DIR="${HOSTINGER_FTP_DIR:-/public_html}"

lftp -c "
set ssl:verify-certificate no
set ftp:ssl-allow yes
open -u ${HOSTINGER_FTP_USER},${HOSTINGER_FTP_PASSWORD} ${HOSTINGER_FTP_HOST}
mirror -R --verbose --delete --exclude-glob .git --exclude-glob node_modules ./out ${REMOTE_DIR}
bye
"

echo "Uploaded ./out to ${HOSTINGER_FTP_HOST}:${REMOTE_DIR}"
