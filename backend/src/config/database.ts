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

console.log(`Database initialized at: ${DATABASE_PATH}`);
