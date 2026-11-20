import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);

export interface DbStatement {
  run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export interface DbInstance {
  exec(sql: string): void;
  pragma(pragmaSql: string): any;
  prepare(sql: string): DbStatement;
  transaction<T extends (...args: any[]) => any>(fn: T): T;
}

function canWriteDir(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.accessSync(dirPath, fs.constants.W_OK);
    const probe = path.join(dirPath, `.write_probe_${process.pid}_${Date.now()}`);
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

const isVercelEnv = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION);
const localDataDir = path.resolve(process.cwd(), 'data');
const localUploadsDir = path.resolve(process.cwd(), 'uploads');
const useEphemeralStorage = isVercelEnv || !canWriteDir(localDataDir);

export const IS_EPHEMERAL_STORAGE = useEphemeralStorage;
export const DATA_DIR = useEphemeralStorage
  ? path.join(os.tmpdir(), 'adaptato-data')
  : localDataDir;
export const UPLOADS_DIR = useEphemeralStorage
  ? path.join(os.tmpdir(), 'adaptato-uploads')
  : localUploadsDir;

for (const dir of [DATA_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const dbPath = path.join(DATA_DIR, 'adaptato.db');

// On serverless cold starts, seed from bundled read-only DB if available
if (useEphemeralStorage && !fs.existsSync(dbPath)) {
  const bundledDb = path.join(localDataDir, 'adaptato.db');
  if (fs.existsSync(bundledDb)) {
    try {
      fs.copyFileSync(bundledDb, dbPath);
    } catch {
      // Ignore copy failure; initializeDatabase + seedInitialData will create fresh tables
    }
  }
}

function createDatabaseConnection(): DbInstance {
  try {
    const BetterSqlite3 = require('better-sqlite3');
    const instance = new BetterSqlite3(dbPath);
    if (!useEphemeralStorage) {
      instance.pragma('journal_mode = WAL');
    }
    instance.pragma('foreign_keys = ON');
    return instance as DbInstance;
  } catch (betterErr) {
    // Fallback to Node 22 built-in node:sqlite if native better-sqlite3 binary is unavailable on serverless
    try {
      const { DatabaseSync } = require('node:sqlite');
      const syncDb = new DatabaseSync(dbPath);
      syncDb.exec('PRAGMA foreign_keys = ON;');

      const wrapper: DbInstance = {
        exec(sql: string) {
          syncDb.exec(sql);
        },
        pragma(pragmaSql: string) {
          try {
            syncDb.exec(`PRAGMA ${pragmaSql};`);
          } catch {
            // ignore unsupported pragmas
          }
        },
        prepare(sql: string): DbStatement {
          const stmt = syncDb.prepare(sql);
          return {
            run(...params: any[]) {
              const res = stmt.run(...params);
              return {
                changes: res?.changes ?? 0,
                lastInsertRowid: Number(res?.lastInsertRowid ?? 0),
              };
            },
            get(...params: any[]) {
              return stmt.get(...params);
            },
            all(...params: any[]) {
              return stmt.all(...params);
            },
          };
        },
        transaction<T extends (...args: any[]) => any>(fn: T): T {
          return ((...args: any[]) => {
            syncDb.exec('BEGIN IMMEDIATE;');
            try {
              const result = fn(...args);
              syncDb.exec('COMMIT;');
              return result;
            } catch (err) {
              try {
                syncDb.exec('ROLLBACK;');
              } catch {
                // ignore rollback failure
              }
              throw err;
            }
          }) as T;
        },
      };

      return wrapper;
    } catch (nodeSqliteErr) {
      console.error('Failed to open SQLite with better-sqlite3 and node:sqlite:', betterErr, nodeSqliteErr);
      throw betterErr;
    }
  }
}

export const db: DbInstance = createDatabaseConnection();

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS professionals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty_summary TEXT NOT NULL,
      crfa TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      photo_url TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      working_hours_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS specialties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'MessageCircle',
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      objectives TEXT NOT NULL,
      how_it_works TEXT NOT NULL,
      confirmation_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (confirmation_status IN ('confirmed', 'to_confirm')),
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS professional_specialties (
      professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
      specialty_id INTEGER NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
      PRIMARY KEY (professional_id, specialty_id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'professional')),
      professional_id INTEGER REFERENCES professionals(id) ON DELETE SET NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      professional_id INTEGER REFERENCES professionals(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      reason TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_code TEXT NOT NULL UNIQUE,
      specialty_id INTEGER NOT NULL REFERENCES specialties(id),
      professional_id INTEGER NOT NULL REFERENCES professionals(id),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_phone TEXT NOT NULL,
      patient_email TEXT NOT NULL DEFAULT '',
      guardian_name TEXT NOT NULL DEFAULT '',
      lgpd_consent INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'reagendado')),
      admin_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_slot
      ON appointments(professional_id, date, time)
      WHERE status IN ('pendente', 'confirmado');

    CREATE INDEX IF NOT EXISTS idx_appointments_date
      ON appointments(date, professional_id);

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Geral',
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Institucional',
      content TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      lgpd_consent INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'respondido')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
