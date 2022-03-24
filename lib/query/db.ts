import SQLiteDatabase from "better-sqlite3";
import fs from "fs";
import dotenv from "dotenv";
import { Channel, User } from "discord.js";
dotenv.config();

interface Database extends SQLiteDatabase.Database {
  deleteKey: (key: string) => void;
  flushKeys: () => void;
  clearUserTag: (user: User) => void;
  userHasTag: (user: User, tag: string) => boolean;
  removeUserTag: (user: User, tag: string) => void;
  addUserTag: (user: User, tag: string) => void;
  setKey: (key: string, value: string) => void;
  getKey: (key: string) => string | undefined;
}

const location: string = process.env.DATABASE_LOCATION?.toString() || "./appdata.db"
const db = new SQLiteDatabase(location, {}) as Database;
let schema: string;

try {
  schema = fs.readFileSync("./schema.sql", { encoding: "utf8" });
  db.exec(schema);
} catch (error) {
  console.error(error);
  process.exit(1);
}

// Some quick methods for common operations

// Key value store crud
db.setKey = (key: string, value: string, expires: number = -1) => {
  console.log(key, value, expires);
  db.prepare(
    `
    INSERT INTO KeyStore(k, v, expires)
    VALUES (?,?,?)
    ON CONFLICT(k) DO UPDATE SET
    k=?,
    v=?,
    expires=?
  `
  ).run(key, value, expires, key, value, expires);
};

db.getKey = (key: string) => {
  return db
    .prepare(
    `
      SELECT * FROM KeyStore WHERE k=?;
    `
    )
    .all(key)[0]?.v;
};

db.deleteKey = (key: string) => {
  db.prepare(
    `
      DELETE FROM KeyStore WHERE k=?;
    `
  ).run(key);
};

db.flushKeys = () => {
  db.prepare(`
    DELETE FROM KeyStore WHERE expires BETWEEN 0 AND ?;
  `).run(Date.now())
}

db.flushKeys();
setInterval(db.flushKeys, 1000 * 60 * 30);
export default db;
