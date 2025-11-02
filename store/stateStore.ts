// store/stateStore.ts
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "stateStore.sqlite");
const db = new Database(dbPath);

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`).run();

export const stateStore = {
  set(key: string, value: any) {
    const valueStr = JSON.stringify(value);
    db.prepare(`
      INSERT INTO state (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `).run(key, valueStr);
  },

  get(key: string) {
    const row = db.prepare(`SELECT value FROM state WHERE key = ?`).get(key);
    return row ? JSON.parse(row.value) : null;
  },

  delete(key: string) {
    db.prepare(`DELETE FROM state WHERE key = ?`).run(key);
  }
};
