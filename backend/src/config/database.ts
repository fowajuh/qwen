import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_PATH = process.env.DATABASE_PATH || join(__dirname, '../../data/nexa.db');

// Initialize database connection
export const db = new Database(DATABASE_PATH) as any;

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// FIX (was crashing every geo-radius query): better-sqlite3 ships with ZERO
// math functions built in. Every "nearby businesses/housing" query in this
// codebase (business.service.ts, housing.service.ts, message.service.ts) uses
// a raw Haversine formula with radians()/cos()/sin()/acos(), which do not
// exist in SQLite and throw "no such function: radians" at runtime.
// Registering them once here fixes every distance query in the app.
db.function('radians', (deg: number) => (deg * Math.PI) / 180);
db.function('cos', (x: number) => Math.cos(x));
db.function('sin', (x: number) => Math.sin(x));
db.function('acos', (x: number) => Math.acos(Math.max(-1, Math.min(1, x))));

console.log(`Database initialized at: ${DATABASE_PATH}`);
