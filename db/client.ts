import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('habits.db');

// Create the tables on first run. I am using CREATE TABLE IF NOT EXISTS
// so the app does not crash if the tables are already there.
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    unit TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    habit_id INTEGER NOT NULL REFERENCES habits(id),
    date TEXT NOT NULL,
    value INTEGER NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    habit_id INTEGER REFERENCES habits(id),
    category_id INTEGER REFERENCES categories(id),
    period TEXT NOT NULL,
    amount INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite);
