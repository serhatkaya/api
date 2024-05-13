const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const path = require("path");

function getDb() {
  const dbFile = path.join(process.cwd(), "src", "db", "database.sqlite");
  let retDb;
  if (!fs.existsSync(dbFile)) {
    fs.closeSync(fs.openSync(dbFile, "w"));

    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
      console.log("Connected to the SQLite database.");
      // Create users table if it doesn't exist
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )`,
        (err) => {
          if (err) {
            console.error(err.message, "ERROR");
          }
        }
      );
      // Create tasks table if it doesn't exist
      db.run(
        `CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_number INTEGER,
          title TEXT,
          description TEXT,
          status TEXT
        )`,
        (err) => {
          if (err) {
            console.error(err.message);
          }
        }
      );
    });
    retDb = db;
  } else {
    retDb = new sqlite3.Database(dbFile);
  }

  return retDb;
}

module.exports = { getDb };
