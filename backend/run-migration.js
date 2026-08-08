const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data/nexa.db');
const db = new Database(dbPath);

const migration = fs.readFileSync(path.join(__dirname, 'src/database/migrations/001_auth_system_sqlite.sql'), 'utf8');
const statements = migration.split(';').filter(s => s.trim().length > 0);

statements.forEach(stmt => {
  try {
    db.exec(stmt.trim() + ';');
  } catch (e) {
    if (e.message.indexOf('already exists') === -1 && e.message.indexOf('duplicate') === -1) {
      console.log('Error:', e.message);
    }
  }
});

console.log('Auth tables created successfully');
db.close();
