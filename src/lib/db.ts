import sqlite3 from 'sqlite3';
import path from 'path';

// Define the path for the SQLite database file
// Place it outside the src directory, e.g., in the project root or a dedicated 'db' folder
const dbPath = path.resolve(process.cwd(), 'finbuddy_auth.db');

let db: sqlite3.Database | null = null;

export function getDbConnection(): sqlite3.Database {
  if (!db) {
    console.log(`Connecting to database at: ${dbPath}`);
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database', err.message);
        throw err; // Throw error if connection fails
      } else {
        console.log('Connected to the SQLite database.');
        // Ensure the users table exists
        db?.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (initErr) => {
          if (initErr) {
            console.error("Error creating users table:", initErr.message);
          } else {
             console.log("Users table checked/created successfully.");
          }
        });
      }
    });
  }
  return db;
}

// Optional: Function to close the database connection if needed
export function closeDbConnection(): void {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database', err.message);
      } else {
        console.log('Closed the database connection.');
        db = null;
      }
    });
  }
}

// Initialize on module load (optional, can also be called on demand)
// getDbConnection(); 