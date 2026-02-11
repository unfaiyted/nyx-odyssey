#!/bin/bash
#
# Cron wrapper for Italy Research Sync
# Called by cron job dd463a6c-599c-4a4e-ae36-b3bb63720e3b after research generation
#
# This script:
# 1. Runs the Italy research sync to parse markdown and update DB
# 2. Logs results
# 3. Reports status

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ODYSSEY_DIR="/root/clawd/odyssey"
LOG_FILE="/root/clawd/logs/italy-research-sync.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date -Iseconds)] $1" | tee -a "$LOG_FILE"
}

log "🔄 Starting Italy Research Sync..."

cd "$ODYSSEY_DIR"

# Run the sync script
if bun scripts/sync-italy-research.ts >> "$LOG_FILE" 2>&1; then
    log "✅ Sync completed successfully"
    exit 0
else
    log "❌ Sync failed"
    exit 1
fi
