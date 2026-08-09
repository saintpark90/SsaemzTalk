#!/usr/bin/env bash
# Ensure the local PostgreSQL server is running and the app role/database exist.
# Idempotent: safe to run on every install and every boot.
set -euo pipefail

DB_NAME="ssaemztalk"
DB_USER="ssaemz"
DB_PASSWORD="ssaemz"

# Install PostgreSQL if it is not already present (e.g. on the default base image
# with no prebuilt snapshot). On a snapshot/build base the packages already exist,
# so this is skipped and no apt work happens on every boot.
if ! command -v pg_isready >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
fi

sudo service postgresql start

# Wait for the server to accept connections.
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    break
  fi
  sleep 1
done

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END \$\$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" >/dev/null
