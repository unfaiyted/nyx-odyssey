# Deployment Guide - Odyssey

Trip planning dashboard for Italy 2026. Same stack as Nyx Console.

## Pre-Deployment Checklist

- [ ] TypeScript compiles (`bun run typecheck`)
- [ ] Build succeeds (`bun run build`)
- [ ] Check for pending database migrations

## Database Migrations

**⚠️ CRITICAL: Always check for pending migrations before deploying!**

```bash
cd /root/clawd/odyssey
ls -la src/db/migrations/
# Apply new migrations:
psql postgresql://postgres:postgres@localhost:5432/odyssey -f src/db/migrations/XXXX_name.sql
```

## Build & Deploy

```bash
cd /root/clawd/odyssey
bun run build
cp -r public/* .output/public/ 2>/dev/null || true
systemctl restart odyssey.service
sleep 5
systemctl is-active odyssey.service
```

## Post-Deployment Verification

- [ ] Service running: `systemctl is-active odyssey.service`
- [ ] Site loads: https://odyssey.nyxed.dev
- [ ] No 500 errors on key routes
- [ ] Database connections working

## Project Structure

- **Port:** 3003
- **Database:** odyssey (PostgreSQL)
- **Service:** odyssey.service
- **Build output:** .output/
- **Migrations:** src/db/migrations/
- **Schema:** src/db/schema.ts
- **Stack:** TanStack Start, React, Tailwind v4, Drizzle ORM + PostgreSQL

## Common Issues

### "relation does not exist"
Run pending migrations: `psql ... -f src/db/migrations/XXXX.sql`

### Service won't start
Check logs: `journalctl -u odyssey.service -n 50 --no-pager`

### GOTCHA: Must run production mode
Dev mode binds IPv6 only — Caddy can't proxy. Always use production build.

### GOTCHA: Use createServerFn
Not `createAPIFileRoute`. Server functions work properly with SSR.

## Rollback

```bash
cd /root/clawd/odyssey
git log --oneline -5
git reset --hard <last-good-commit>
bun run build
cp -r public/* .output/public/ 2>/dev/null || true
systemctl restart odyssey.service
```
