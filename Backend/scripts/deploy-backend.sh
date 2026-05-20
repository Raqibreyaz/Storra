#!/usr/bin/env bash

# -e: exit when error occurs
# -u: not defined variable usage will be treated as error
# -o pipefail: if a pipeline fails then whole pipeline will be treated as failed
set -Eeuo pipefail

REPO_DIR="$HOME/Personal-Google-Drive"
BACKEND_DIR="$REPO_DIR/Backend"
LOG_DIR="$HOME/deploy-logs"
LOG_FILE="$LOG_DIR/storraBackend-$(date +%Y%m%d-%H%M%S).log"

# all log files will go this directory
mkdir -p "$LOG_DIR"

# all error/log will be written to this file
exec >>"$LOG_FILE" 2>&1

on_error() {
  local exit_code=$?
  local line_no=$1
  echo "[ERROR] Deployment failed at line $line_no with exit code $exit_code"
  exit "$exit_code"
}
trap 'on_error $LINENO' ERR

echo "[INFO] Starting deployment at $(date -Is)"

cd "$REPO_DIR"
echo "[INFO] pulling latest changes from github..."
git pull

if [ "${SHOULD_INSTALL:-false}" = "true" ]; then
    echo "[INFO] package manifest changed, running pnpm install..."
    cd "$BACKEND_DIR"
    pnpm install --frozen-lockfile
    cd "$REPO_DIR"
else
    echo "[INFO] no dependency installation required."
fi

echo "[INFO] reloading server with the latest changes..."
pm2 reload storraBackend --update-env

echo "[INFO] Server deployed successfully at $(date -Is)"