import db from '../../../lib/query/db';

export default function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS CommandPermissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild TEXT NOT NULL,
      command TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);
}
