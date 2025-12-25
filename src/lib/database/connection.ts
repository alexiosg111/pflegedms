import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database;

function getDatabasePath(): string {
    const appDataPath = process.env.APPDATA || (process.platform === 'darwin' 
        ? path.join(process.env.HOME || '', 'Library', 'Application Support') 
        : path.join(process.env.HOME || '', '.config'));
    
    const pflegedmsPath = path.join(appDataPath, 'pflegedms');
    
    if (!existsSync(pflegedmsPath)) {
        mkdirSync(pflegedmsPath, { recursive: true });
    }
    
    return path.join(pflegedmsPath, 'pflegedms.db');
}

export function getConnection(): Database.Database {
    if (!db) {
        const dbPath = getDatabasePath();
        db = new Database(dbPath, {
            verbose: console.log
        });
        
        // Enable foreign keys
        db.pragma('foreign_keys = ON');
        
        console.log('Database connection established');
    }
    return db;
}

export function closeConnection(): void {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed');
    }
}