import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

interface MigrationResult {
  success: boolean;
  message: string;
}

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'pflegedienst.db');

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
  }

  /**
   * Initialize database with master password encryption
   * @param masterPassword - Master password to encrypt/decrypt database
   * @returns Promise<void>
   */
  async initialize(masterPassword: string): Promise<void> {
    try {
      // Open database
      this.db = new Database(this.dbPath);

      // Enable SQLCipher encryption
      this.db.pragma(`key = '${this.escapeSQLString(masterPassword)}'`);

      // Test encryption by running a simple pragma
      try {
        this.db.pragma('quick_check');
      } catch (err) {
        throw new Error('Invalid master password or corrupted database');
      }

      // Run migrations
      await this.runMigrations();

      console.log('Database initialized successfully');
    } catch (err) {
      this.close();
      throw err;
    }
  }

  /**
   * Run all pending migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create migrations table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Read migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const stmt = this.db.prepare('SELECT name FROM migrations WHERE name = ?');
      const exists = stmt.get(file);

      if (!exists) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(filePath, 'utf-8');

        try {
          // Execute migration in transaction
          const transaction = this.db.transaction(() => {
            this.db!.exec(sql);
            this.db!.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
          });

          transaction();
          console.log(`✓ Migration ${file} completed`);
        } catch (err) {
          console.error(`✗ Migration ${file} failed:`, err);
          throw err;
        }
      }
    }
  }

  /**
   * Execute a SELECT query
   */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[] {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(sql);
      return params ? stmt.all(...params) : stmt.all();
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  }

  /**
   * Execute a single row SELECT query
   */
  queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): T | undefined {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(sql);
      return params ? stmt.get(...params) : stmt.get();
    } catch (err) {
      console.error('Query one error:', err);
      throw err;
    }
  }

  /**
   * Execute an INSERT/UPDATE/DELETE statement
   */
  execute(sql: string, params?: unknown[]): { changes: number; lastInsertRowid: number } {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(sql);
      const result = params ? stmt.run(...params) : stmt.run();
      return {
        changes: result.changes,
        lastInsertRowid: Number(result.lastInsertRowid),
      };
    } catch (err) {
      console.error('Execute error:', err);
      throw err;
    }
  }

  /**
   * Run multiple statements in a transaction
   */
  transaction<T>(fn: () => T): T {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const transaction = this.db.transaction(fn);
      return transaction();
    } catch (err) {
      console.error('Transaction error:', err);
      throw err;
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Get database file path
   */
  getPath(): string {
    return this.dbPath;
  }

  /**
   * Escape SQL string to prevent injection (basic, SQLite uses parameters anyway)
   */
  private escapeSQLString(str: string): string {
    return str.replace(/'/g, "''");
  }

  /**
   * Backup database to a file
   */
  backup(backupPath: string): boolean {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const backupDb = new Database(backupPath);
      const backup = this.db.backup(backupDb);
      backup.step(-1); // Backup all pages
      backup.finish();
      backupDb.close();
      return true;
    } catch (err) {
      console.error('Backup error:', err);
      return false;
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();
