import SQLiteDatabase from 'better-sqlite3';
import fs from 'fs';
import dotenv from 'dotenv';
import { User } from 'discord.js';
dotenv.config();

interface Database extends SQLiteDatabase.Database {
  deleteKey: (key: string) => void;
  flushKeys: () => void;
  clearUserTag: (user: User) => void;
  userHasTag: (user: User, tag: string) => boolean;
  removeUserTag: (user: User, tag: string) => void;
  addUserTag: (user: User, tag: string) => void;
}

const location: string =
  process.env.DATABASE_LOCATION?.toString() || '../../appdata.db';
const db = new SQLiteDatabase(location, {}) as Database;
let schema: string;

try {
  schema = fs.readFileSync('./schema.sql', { encoding: 'utf8' });
  db.exec(schema);
} catch (error) {
  console.error(error);
  process.exit(1);
}

export default db;
