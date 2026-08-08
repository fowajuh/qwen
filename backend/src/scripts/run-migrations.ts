import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigration(migrationFile: string) {
  const client = await pool.connect();
  
  try {
    console.log(`Running migration: ${migrationFile}`);
    
    const sql = await fs.readFile(migrationFile, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log(`✅ Migration completed: ${migrationFile}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Migration failed: ${migrationFile}`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function runAllMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');
    
    // Check if database is accessible
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');
    
    // Get all migration files in order
    const migrationsDir = path.join(__dirname);
    const files = await fs.readdir(migrationsDir);
    
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically (001_, 002_, etc.)
    
    if (migrationFiles.length === 0) {
      console.log('No migrations found.');
      return;
    }
    
    console.log(`Found ${migrationFiles.length} migration(s):\n`);
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      await runMigration(filePath);
      console.log('');
    }
    
    console.log('🎉 All migrations completed successfully!\n');
    
    // Close pool
    await pool.end();
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllMigrations();
}

export { runAllMigrations };
