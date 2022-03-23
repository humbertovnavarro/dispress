import SQLiteDatabase from "better-sqlite3";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
interface Database extends SQLiteDatabase.Database {
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

// Key value store for simple command persistence
db.setKey = (key: string, value: string) => {
  db.prepare(
    `
    INSERT INTO Keys(k, v)
    VALUES (?,?)
    ON CONFLICT(k) DO UPDATE SET
    k=?,
    v=?
  `
  ).run();
};
db.getKey = (key: string) => {
  return db
    .prepare(
    `
      SELECT * FROM Keys where k=?
    `
    )
    .all()[0];
};

export default db;
