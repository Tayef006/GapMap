const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "gapmap.db");
const schemaPath = path.join(__dirname, "schema.sql");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    fs.readFile(schemaPath, "utf8", (readErr, schemaSql) => {
      if (readErr) {
        return reject(
          new Error(`Could not read schema.sql: ${readErr.message}`)
        );
      }

      db.serialize(() => {
        db.run("PRAGMA foreign_keys = ON;");

        db.exec(schemaSql, (execErr) => {
          if (execErr) {
            return reject(
              new Error(`Could not initialise database schema: ${execErr.message}`)
            );
          }

          db.run(
            `INSERT OR IGNORE INTO users (id, name, email)
             VALUES (1, 'Test User', 'test@example.com')`,
            (seedErr) => {
              if (seedErr) {
                return reject(
                  new Error(`Could not seed default user: ${seedErr.message}`)
                );
              }

              console.log("Database schema initialised successfully.");
              console.log("Default test user ensured.");
              resolve();
            }
          );
        });
      });
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
};