import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'uno.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scoreboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    score INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
  );
`);

export default db;
