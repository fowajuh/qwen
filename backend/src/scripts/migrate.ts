import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'nexa',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

// Track which migrations have been run
async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Migrations table ready');
}

// Get list of applied migrations
async function getAppliedMigrations(): Promise<string[]> {
  const result = await pool.query(
    'SELECT version FROM schema_migrations ORDER BY version'
  );
  return result.rows.map(row => row.version);
}

// Run a single migration file
async function runMigration(migrationFile: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log(`📄 Running migration: ${migrationFile}`);
    
    // Execute migration
    await client.query(sql);
    
    // Record migration
    const version = migrationFile.split('_')[0];
    await client.query(
      'INSERT INTO schema_migrations (version) VALUES ($1)',
      [version]
    );
    
    await client.query('COMMIT');
    console.log(`✅ Completed: ${migrationFile}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed: ${migrationFile}`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Main migration runner
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  
  try {
    // Ensure migrations table exists
    await createMigrationsTable();
    
    // Get already applied migrations
    const applied = await getAppliedMigrations();
    console.log(`📋 Already applied: ${applied.length} migrations\n`);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure ordered execution
    
    // Filter out already applied migrations
    const pending = files.filter(file => {
      const version = file.split('_')[0];
      return !applied.includes(version);
    });
    
    if (pending.length === 0) {
      console.log('✅ Database is up to date. No pending migrations.');
      return;
    }
    
    console.log(`⏳ Pending migrations: ${pending.length}\n`);
    
    // Run each pending migration
    for (const file of pending) {
      await runMigration(file);
    }
    
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Rollback last migration (basic implementation)
async function rollbackLastMigration() {
  console.log('🔄 Rolling back last migration...');
  
  const applied = await getAppliedMigrations();
  
  if (applied.length === 0) {
    console.log('No migrations to rollback');
    return;
  }
  
  const lastVersion = applied[applied.length - 1];
  const lastMigrationFile = fs.readdirSync(path.join(__dirname, 'migrations'))
    .find(f => f.startsWith(lastVersion));
  
  if (!lastMigrationFile) {
    console.error('Migration file not found');
    return;
  }
  
  // In production, you'd have down migration scripts
  console.warn('⚠️  Rollback not implemented - manual intervention required');
  console.warn(`   Last migration: ${lastMigrationFile}`);
}

// CLI interface
const command = process.argv[2];

if (command === 'rollback') {
  rollbackLastMigration().then(() => pool.end());
} else {
  runMigrations();
}

export default runMigrations;
