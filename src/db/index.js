import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { DB_NAME } from "../constants.js";

const schema = `
    PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT CHECK(role IN('ATTENDEE' , 'ORGANIZER' , 'ADMIN')) DEFAULT 'ATTENDEE',
          refresh_token TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

    CREATE TABLE IF NOT EXISTS events(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organizer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        venue TEXT NOT NULL,
        start_time  TEXT NOT NULL,
        status TEXT CHECK(status IN ('DRAFT','PUBLISHED','CANCELLED','COMPLETED')) DEFAULT 'DRAFT',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE 
    );

    CREATE TABLE IF NOT EXISTS ticket_tiers(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        tier_name TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >=0),
        available_seats INTEGER NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attendee_id INTEGER NOT NULL,
        tier_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        booking_status TEXT CHECK (booking_status IN ('PENDING_LOCK' , 'PAID' , 'CANCELLED' , 'EXPIRED')) DEFAULT 'PENDING_LOCK',
        seat_lock_expires_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attendee_id) REFERENCES users(id),
        FOREIGN KEY (tier_id) REFERENCES ticket_tiers(id)

    );

    CREATE TABLE IF NOT EXISTS checkins(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER UNIQUE NOT NULL,
        qr_code TEXT UNIQUE NOT NULL,
        verified_by_organizer_id INTEGER,
        checked_in_at TEXT,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (verified_by_organizer_id) REFERENCES users(id)
    );



CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id ON ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_attendee_id ON bookings(attendee_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tier_id ON bookings(tier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_expires ON bookings(booking_status, seat_lock_expires_at);
CREATE INDEX IF NOT EXISTS idx_checkins_booking_id ON checkins(booking_id);
`;

let dbInstance = null;

export const getDBFilePath = () => {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  // Check if running on Vercel or in serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", DB_NAME);
    const localDbPath = path.resolve(process.cwd(), DB_NAME);

    // If the local database exists and /tmp does not have it yet, copy it
    if (fs.existsSync(localDbPath) && !fs.existsSync(tmpDbPath)) {
      try {
        fs.copyFileSync(localDbPath, tmpDbPath);
        console.log(`Copied seed database to writable ${tmpDbPath}`);
      } catch (copyErr) {
        console.warn("Failed to copy seed database to /tmp:", copyErr.message);
      }
    }
    return tmpDbPath;
  }

  return path.resolve(process.cwd(), DB_NAME);
};

export const connectDB = () => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  return new Promise((resolve, reject) => {
    const dbPath = getDBFilePath();
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ SQLite connection failed:", err.message);
        return reject(err);
      }
      console.log(
        `\n⚙️ SQLite connected successfully! Database File: ${dbPath}`,
      );
      dbInstance = db;

      db.exec(schema, (execError) => {
        if (execError) {
          console.error(execError.message);
          return reject(execError);
        }
        console.log("Schema executed successfully!");

        // Auto-seed default sample events if table is empty (ensures Vercel serverless deployments always have events)
        db.get("SELECT COUNT(*) as count FROM events", (countErr, row) => {
          if (!countErr && (!row || row.count === 0)) {
            console.log("🌱 Database is empty. Seeding initial conferences and ticket tiers...");
            const seedQuery = `
              INSERT OR IGNORE INTO users (id, name, email, password_hash, role)
              VALUES (1, 'TechSummit Organizer', 'organizer@eventpulse.io', '$2b$10$wK1Rk3Z7x9xY.sampleHashForDemoOrganizer', 'ORGANIZER');

              INSERT INTO events (id, organizer_id, title, description, venue, start_time, status)
              VALUES 
              (1, 1, 'React Global Summit 2026', 'The premier gathering for full-stack and frontend engineers exploring modern React, SSR, and edge architecture.', 'Metropolitan Pavilion, New York, NY', '2026-11-20 09:30:00', 'PUBLISHED'),
              (2, 1, 'Node.js & Cloud Conference 2026', 'Deep dive into microservices, runtime performance, serverless scaling, and distributed architecture.', 'Convention Center Hall A, San Francisco, CA', '2026-10-15 09:00:00', 'PUBLISHED'),
              (3, 1, 'DevOps & AI Systems World', 'Uniting infrastructure engineers, platform teams, and AI practitioners scaling production workloads.', 'Convention Center Hall B, Austin, TX', '2026-12-05 10:00:00', 'PUBLISHED');

              INSERT INTO ticket_tiers (id, event_id, tier_name, price, available_seats)
              VALUES
              (1, 1, 'General Admission', 89, 150),
              (2, 1, 'Executive VIP Pass', 249, 30),
              (3, 2, 'Developer Pass', 50, 100),
              (4, 2, 'VIP All-Access', 150, 25),
              (5, 3, 'Standard Conference Pass', 75, 120),
              (6, 3, 'VIP Workshop Pass', 199, 40);
            `;
            db.exec(seedQuery, (seedErr) => {
              if (seedErr) {
                console.warn("Auto-seed notice:", seedErr.message);
              } else {
                console.log("✅ Seed events and ticket tiers loaded successfully!");
              }
              resolve(db);
            });
          } else {
            resolve(db);
          }
        });
      });
    });
  });
};






export const getDB = () => {
  return dbInstance;
};
