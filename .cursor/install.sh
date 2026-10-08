#!/usr/bin/env bash
# Cloud Agent install phase: prepare a self-contained local dev environment.
# Uses a local PostgreSQL instead of Supabase so no secrets are required.
# Idempotent: safe to run repeatedly.
set -euo pipefail

cd "$(dirname "$0")/.."

# Local dev connection strings (local Postgres, not Supabase — no secrets needed).
if [ ! -f .env ]; then
  cat > .env <<'ENV'
DATABASE_URL="postgresql://ssaemz:ssaemz@localhost:5432/ssaemztalk?schema=public"
DIRECT_URL="postgresql://ssaemz:ssaemz@localhost:5432/ssaemztalk?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ssaemztalk-dev-secret-change-in-production"
UPLOAD_DIR="public/uploads"
ENV
fi

bash .cursor/setup-postgres.sh

npm ci

npx prisma db push
npm run db:seed

mkdir -p public/uploads
