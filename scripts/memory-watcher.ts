/**
 * Memory File Watcher
 * 
 * Watches /root/clawd/memory/*.md files for changes and auto-imports
 * relevant data (weight entries, nutrition, workouts) into the Odyssey database.
 * 
 * Usage: bun run scripts/memory-watcher.ts [--once] [--file <path>]
 *   --once   Process all files once and exit (no watch)
 *   --file   Process a single file
 */

import { watch } from 'chokidar';
import { readFileSync, existsSync, readFile, writeFileSync, mkdirSync } from 'fs';
import { resolve, basename } from 'path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const MEMORY_DIR = '/root/clawd/memory';
const STATE_FILE = resolve(__dirname, '../.memory-watcher-state.json');
const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';

const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

// ── State Management ───────────────────────────────────
interface WatcherState {
  fileHashes: Record<string, string>;
  lastRun: string;
}

function loadState(): WatcherState {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return { fileHashes: {}, lastRun: '' };
}

function saveState(state: WatcherState) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function fileHash(content: string): string {
  return Bun.hash(content).toString(36);
}

// ── Parsers ────────────────────────────────────────────

interface WeightEntry {
  date: string; // YYYY-MM-DD
  weight: number;
  bodyFatPct?: number;
  muscleMassPct?: number;
  notes?: string;
}

interface NutritionEntry {
  date: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface WorkoutEntry {
  date: string;
  name: string;
  type?: string;
  durationMinutes?: number;
  notes?: string;
}

/**
 * Parse a date like "Feb 25, 2025" or "2026-01-28" into YYYY-MM-DD
 */
function parseDate(dateStr: string): string | null {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  // MM/DD/YY or MM/DD/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let year = parseInt(slashMatch[3]);
    if (year < 100) year += 2000;
    return `${year}-${slashMatch[1].padStart(2, '0')}-${slashMatch[2].padStart(2, '0')}`;
  }
  // "Mon DD, YYYY" format
  const months: Record<string, string> = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  const match = dateStr.match(/(\w{3})\w*\s+(\d{1,2}),?\s+(\d{4})/i);
  if (match) {
    const month = months[match[1].toLowerCase()];
    if (month) {
      return `${match[3]}-${month}-${match[2].padStart(2, '0')}`;
    }
  }
  return null;
}

/**
 * Extract weight entries from the weight history table in fitness.md
 */
function parseWeightHistory(content: string): WeightEntry[] {
  const entries: WeightEntry[] = [];
  
  // Match markdown table rows with weight data
  // | Date | Weight (lbs) | Weekly Change | Total Lost |
  const tableRegex = /\|\s*([^|]+)\s*\|\s*([\d.]+)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|/g;
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const dateStr = match[1].trim();
    const weight = parseFloat(match[2]);
    if (isNaN(weight) || weight < 100 || weight > 500) continue;
    const date = parseDate(dateStr);
    if (!date) continue;
    entries.push({ date, weight });
  }

  // Also match inline weight mentions like "**Feb 5, 2026:** 221.6 lbs"
  const inlineRegex = /\*{0,2}(\w+ \d{1,2},? \d{4}):?\*{0,2}\s*([\d.]+)\s*lbs/gi;
  while ((match = inlineRegex.exec(content)) !== null) {
    const date = parseDate(match[1]);
    const weight = parseFloat(match[2]);
    if (date && !isNaN(weight) && weight > 100 && weight < 500) {
      // Don't duplicate if already captured from table
      if (!entries.find(e => e.date === date)) {
        entries.push({ date, weight });
      }
    }
  }

  return entries;
}

/**
 * Extract InBody scan data as enhanced weight entries
 */
function parseInBodyScans(content: string): WeightEntry[] {
  const entries: WeightEntry[] = [];
  // | Date | Weight | SMM (lbs) | Body Fat (lbs) | PBF% | ...
  const regex = /\|\s*(\d{2}\/\d{2}\/\d{2})\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)%/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const date = parseDate(match[1]);
    const weight = parseFloat(match[2]);
    const bodyFatPct = parseFloat(match[5]);
    if (date && !isNaN(weight)) {
      entries.push({
        date,
        weight,
        bodyFatPct: isNaN(bodyFatPct) ? undefined : bodyFatPct,
        notes: `InBody scan - SMM: ${match[3]} lbs, Body Fat: ${match[4]} lbs`,
      });
    }
  }
  return entries;
}

/**
 * Extract nutrition data from daily memory files
 * Looks for patterns like "Calories: 1,290 | Protein: 154.5g"
 */
function parseNutrition(content: string, fileDate: string | null): NutritionEntry[] {
  const entries: NutritionEntry[] = [];
  if (!fileDate) return entries;

  // Pattern: "Calories: X | Protein: Xg | Carbs: Xg | Fat: Xg"
  const nutritionRegex = /Calories?:?\s*([\d,]+)\s*(?:\||\n|,)\s*Protein:?\s*([\d.]+)\s*g?\s*(?:\||\n|,)\s*Carbs?:?\s*([\d.]+)\s*g?\s*(?:\||\n|,)\s*Fat:?\s*([\d.]+)\s*g?/gi;
  let match;
  while ((match = nutritionRegex.exec(content)) !== null) {
    entries.push({
      date: fileDate,
      name: 'Daily Total',
      calories: parseFloat(match[1].replace(/,/g, '')),
      protein: parseFloat(match[2]),
      carbs: parseFloat(match[3]),
      fat: parseFloat(match[4]),
    });
  }

  return entries;
}

/**
 * Extract workout mentions from daily memory files
 */
function parseWorkouts(content: string, fileDate: string | null): WorkoutEntry[] {
  const entries: WorkoutEntry[] = [];
  if (!fileDate) return entries;

  // Look for workout/gym/training mentions
  const workoutPatterns = [
    /(?:went to|hit|visited|did)\s+(?:the\s+)?(?:gym|planet fitness|pf)/i,
    /(?:workout|training session|lifting|resistance training)/i,
    /(?:great pump|solid session|leg day|push day|pull day|upper body|lower body)/i,
  ];

  const lines = content.split('\n');
  for (const line of lines) {
    for (const pattern of workoutPatterns) {
      if (pattern.test(line)) {
        // Determine workout type from context
        let type = 'strength';
        let name = 'Gym Session';
        if (/cardio|running|walking|treadmill/i.test(line)) {
          type = 'cardio';
          name = 'Cardio Session';
        }
        if (/leg day|squats|leg press/i.test(line)) name = 'Leg Day';
        if (/push day|bench|chest/i.test(line)) name = 'Push Day';
        if (/pull day|rows|back/i.test(line)) name = 'Pull Day';
        if (/planet fitness|pf/i.test(line)) name = 'Planet Fitness Workout';

        // Avoid duplicating for same date
        if (!entries.find(e => e.date === fileDate)) {
          entries.push({
            date: fileDate,
            name,
            type,
            notes: line.replace(/^[-*]\s*/, '').trim(),
          });
        }
        break;
      }
    }
  }

  return entries;
}

/**
 * Extract date from filename like "2026-02-05.md"
 */
function dateFromFilename(filepath: string): string | null {
  const name = basename(filepath, '.md');
  if (/^\d{4}-\d{2}-\d{2}$/.test(name)) return name;
  return null;
}

// ── Database Import ────────────────────────────────────

async function importWeightEntries(entries: WeightEntry[]): Promise<number> {
  let imported = 0;
  for (const entry of entries) {
    // Check if entry already exists for this date
    const existing = await db.query.weightEntries.findFirst({
      where: eq(schema.weightEntries.date, entry.date),
    });
    
    if (existing) {
      // Update if weight changed or we have new body comp data
      if (existing.weight !== entry.weight || 
          (entry.bodyFatPct && existing.bodyFatPct !== entry.bodyFatPct)) {
        await db.update(schema.weightEntries)
          .set({
            weight: entry.weight,
            ...(entry.bodyFatPct !== undefined ? { bodyFatPct: entry.bodyFatPct } : {}),
            ...(entry.notes ? { notes: entry.notes } : {}),
          })
          .where(eq(schema.weightEntries.id, existing.id));
        imported++;
      }
    } else {
      await db.insert(schema.weightEntries).values({
        date: entry.date,
        weight: entry.weight,
        unit: 'lbs',
        bodyFatPct: entry.bodyFatPct,
        notes: entry.notes,
      });
      imported++;
    }
  }
  return imported;
}

async function importNutritionEntries(entries: NutritionEntry[]): Promise<number> {
  let imported = 0;
  for (const entry of entries) {
    // Check for existing daily total on this date
    const existing = await db.query.nutritionEntries.findFirst({
      where: and(
        eq(schema.nutritionEntries.date, entry.date),
        eq(schema.nutritionEntries.name, 'Daily Total'),
      ),
    });

    if (!existing) {
      await db.insert(schema.nutritionEntries).values({
        date: entry.date,
        name: entry.name,
        mealType: 'meal',
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber,
        sugar: entry.sugar,
        sodium: entry.sodium,
      });
      imported++;
    }
  }
  return imported;
}

async function importWorkouts(entries: WorkoutEntry[]): Promise<number> {
  let imported = 0;
  for (const entry of entries) {
    // Check for existing workout on this date
    const existing = await db.query.workouts.findFirst({
      where: eq(schema.workouts.date, entry.date),
    });

    if (!existing) {
      await db.insert(schema.workouts).values({
        date: entry.date,
        name: entry.name,
        type: entry.type || 'strength',
        durationMinutes: entry.durationMinutes,
        notes: entry.notes,
        completed: true,
      });
      imported++;
    }
  }
  return imported;
}

// ── File Processing ────────────────────────────────────

async function processFile(filepath: string, state: WatcherState): Promise<boolean> {
  if (!existsSync(filepath)) return false;
  
  const content = readFileSync(filepath, 'utf-8');
  const hash = fileHash(content);
  const name = basename(filepath);
  
  // Skip if unchanged
  if (state.fileHashes[name] === hash) return false;
  
  console.log(`📄 Processing: ${name}`);
  const fileDate = dateFromFilename(filepath);
  
  let totalImported = 0;

  // Parse weight data (primarily from fitness.md)
  const weightEntries = [
    ...parseWeightHistory(content),
    ...parseInBodyScans(content),
  ];
  if (weightEntries.length > 0) {
    const count = await importWeightEntries(weightEntries);
    if (count > 0) console.log(`  ⚖️  Imported ${count} weight entries`);
    totalImported += count;
  }

  // Parse nutrition (from daily files)
  const nutritionEntries = parseNutrition(content, fileDate);
  if (nutritionEntries.length > 0) {
    const count = await importNutritionEntries(nutritionEntries);
    if (count > 0) console.log(`  🍎 Imported ${count} nutrition entries`);
    totalImported += count;
  }

  // Parse workouts (from daily files)
  const workoutEntries = parseWorkouts(content, fileDate);
  if (workoutEntries.length > 0) {
    const count = await importWorkouts(workoutEntries);
    if (count > 0) console.log(`  💪 Imported ${count} workout entries`);
    totalImported += count;
  }

  // Update state
  state.fileHashes[name] = hash;
  saveState(state);
  
  if (totalImported === 0) {
    console.log(`  ℹ️  No new data to import`);
  }
  
  return totalImported > 0;
}

// ── Main ───────────────────────────────────────────────

async function processAllFiles(state: WatcherState) {
  const glob = new Bun.Glob('*.md');
  const files = Array.from(glob.scanSync(MEMORY_DIR));
  
  console.log(`🔍 Scanning ${files.length} memory files...`);
  let totalChanged = 0;
  
  for (const file of files) {
    const changed = await processFile(resolve(MEMORY_DIR, file), state);
    if (changed) totalChanged++;
  }
  
  state.lastRun = new Date().toISOString();
  saveState(state);
  console.log(`✅ Done. ${totalChanged} files had new data.`);
}

async function main() {
  const args = process.argv.slice(2);
  const once = args.includes('--once');
  const fileIdx = args.indexOf('--file');
  const singleFile = fileIdx >= 0 ? args[fileIdx + 1] : null;
  
  const state = loadState();
  
  if (singleFile) {
    const filepath = resolve(singleFile);
    await processFile(filepath, state);
    await sql.end();
    return;
  }
  
  if (once) {
    await processAllFiles(state);
    await sql.end();
    return;
  }

  // Initial scan
  await processAllFiles(state);
  
  // Watch for changes
  console.log(`\n👁️  Watching ${MEMORY_DIR}/*.md for changes...`);
  const watcher = watch(`${MEMORY_DIR}/*.md`, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 },
  });
  
  watcher.on('change', async (filepath) => {
    console.log(`\n🔄 File changed: ${basename(filepath)}`);
    await processFile(filepath, state);
  });
  
  watcher.on('add', async (filepath) => {
    console.log(`\n📝 New file: ${basename(filepath)}`);
    await processFile(filepath, state);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down watcher...');
    await watcher.close();
    await sql.end();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await watcher.close();
    await sql.end();
    process.exit(0);
  });
}

main().catch(console.error);
