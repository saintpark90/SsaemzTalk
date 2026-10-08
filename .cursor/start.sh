#!/usr/bin/env bash
# Cloud Agent start phase: bring up runtime services on every boot.
# Starts the local PostgreSQL server (data persists from the install snapshot).
set -euo pipefail

cd "$(dirname "$0")/.."

bash .cursor/setup-postgres.sh
