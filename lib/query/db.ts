import Database from "better-sqlite3";
import fs from "fs";
const db = new Database("./data.db", {});
let schema: string;

try {
  schema = fs.readFileSync("./schema.sql", { encoding: "utf8" });
  db.exec(schema);
} catch (error) {
  console.error(error);
  process.exit(1);
}

export default db;
