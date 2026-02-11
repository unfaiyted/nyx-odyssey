# Italy Trip Research Cron Jobs

Automated research and planning for Italy trip (June 10 - July 10, 2026).

## Overview

These cron jobs help research destinations, activities, and experiences for the Italy trip by:
- Adding new destinations to research queue
- Rotating through focus areas for daily research
- Tracking findings in structured markdown files
- Notifying Discord #trip channel of updates

## Cron Jobs

### 1. Italy Trip Ideas
- **Schedule:** Monday, Wednesday, Friday at 10:00 AM
- **Script:** `scripts/cron-italy-trip-ideas.ts`
- **Purpose:** Research destinations, capture screenshots, gather directions
- **Output:** 
  - Adds new destination to `memory/trips/italy-2026-recommendations.md`
  - Creates database entry for tracking
  - Discord notification

### 2. Italy Trip Daily
- **Schedule:** Daily at 2:00 PM
- **Script:** `scripts/cron-italy-trip-daily.ts`
- **Purpose:** Check planning doc, research one item from rotating focus areas
- **Output:**
  - Appends research notes to recommendations file
  - Tracks state in `.italy-research-state.json`
  - Discord notification

## Research Focus Areas (Rotating)

The daily cron job cycles through 7 research focus areas:

1. **Things to do IN Vicenza** 🏛️
   - Teatro Olimpico, Basilica Palladiana
   - Piazza dei Signori, Villa Rotonda
   - Local food markets, aperitivo spots

2. **Day trips within 1 hour** 🚗
   - Verona, Venice, Padua
   - Lake Garda, Prosecco Hills

3. **Day trips 1-2 hours** 🚂
   - Bologna, Dolomites, Treviso
   - Ferrara, Ravenna

4. **Weekend trips** 🧳
   - Florence, Cinque Terre
   - Milan, Turin, Liguria Coast

5. **Food experiences** 🍝
   - Pasta making classes
   - Wine tastings (Amarone, Prosecco)
   - Food markets, osterias, gelato tours

6. **Summer events/festivals (June-July 2026)** 🎭
   - Verona Opera Festival
   - Venice Architecture Biennale
   - Siena Palio, Umbria Jazz

7. **Hidden gems and local secrets** 💎
   - Asolo, Monselice, Este
   - Bassano del Grappa, Marostica, Soave

## Output Files

### memory/trips/italy-2026-recommendations.md
Main recommendations file with structured entries:
- Recommendation number (001, 002, etc.)
- Status (🔍 Researching, ✅ Approved, ❌ No-go, etc.)
- Location and category
- Research notes
- Logistics (distance, drive time, train time)
- Pro tips

### memory/trips/italy-2026-screenshots/*.png
Screenshot storage for:
- Google Maps directions
- Location images
- Ticket booking pages
- Event schedules

### State Files
- `.italy-research-state.json` - Tracks daily research rotation progress

## Database Schema

### trip_cron_jobs
Tracks cron job execution state:
- `cronJobId` - External ID from nyx-console
- `name`, `schedule`, `description`
- `lastRun`, `lastStatus`, `nextRun`

### trip_recommendations
Stores structured recommendations:
- `recommendationNumber` - Sequential ID (001, 002, etc.)
- `title`, `description`, `what`
- `whySpecial`, `logistics`, `proTips` (JSON)
- `status` - pending, maybe, approved, booked, no-go
- `homeBaseAddress`, `homeBaseLat`, `homeBaseLng`

### destination_events
Tracks events/performances at destinations:
- `name`, `description`, `eventType`
- `dates`, `startDate`, `endDate`
- `websiteUrl`, `bookingUrl`, `price`

## Setup

1. **Seed the cron jobs:**
   ```bash
   bun run scripts/seed-cron-job-link.ts
   ```

2. **Run migrations:**
   ```bash
   bun run db:migrate
   ```

3. **Test manually:**
   ```bash
   bun run scripts/cron-italy-trip-ideas.ts
   bun run scripts/cron-italy-trip-daily.ts
   ```

## Environment Variables

Required environment variables (if using Discord notifications):
- `DISCORD_BOT_TOKEN` - For Discord API access
- `DATABASE_URL` - PostgreSQL connection string

## Manual Research Workflow

When a cron job adds a new research entry:

1. Check `memory/trips/italy-2026-recommendations.md`
2. Review the search query provided
3. Research the destination/activity
4. Update the entry with findings:
   - Fill in "What" section
   - Add "Why it's special" bullet points
   - Update logistics (distance, drive/train time)
   - Add pro tips
   - Update status to ✅ Approved or ❌ No-go
5. Capture screenshots to `italy-2026-screenshots/`
6. Run sync script to update database:
   ```bash
   bun run scripts/sync-italy-recommendations.ts --tripId=LMp0E_5U2QFsNL-MoGDHh
   ```

## Discord Channel

Notifications sent to: `#trip` (1468983452404682874)

Notification types:
- New destination added to queue
- Daily research topic update
- Status changes (approved/booked/no-go)
