"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initDatabase = exports.getDb = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../../database/investment.db');
let db = null;
const getDb = () => {
    if (!db) {
        db = new sqlite3_1.default.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Database connection failed:', err);
            }
            else {
                console.log('Connected to SQLite database');
            }
        });
    }
    return db;
};
exports.getDb = getDb;
const initDatabase = () => {
    return new Promise((resolve, reject) => {
        const database = (0, exports.getDb)();
        database.serialize(() => {
            // 用户表
            database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            // 股票表
            database.run(`
        CREATE TABLE IF NOT EXISTS stocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          category TEXT,
          shares INTEGER DEFAULT 0,
          avg_price REAL DEFAULT 0,
          market TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            // 股价历史表
            database.run(`
        CREATE TABLE IF NOT EXISTS stock_prices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          stock_id INTEGER NOT NULL,
          price REAL NOT NULL,
          change_percent REAL DEFAULT 0,
          volume INTEGER,
          date DATE DEFAULT CURRENT_DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (stock_id) REFERENCES stocks(id)
        )
      `);
            // 周报PDF表
            database.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          file_path TEXT,
          report_date DATE DEFAULT CURRENT_DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log('Database tables initialized');
                    resolve();
                }
            });
        });
    });
};
exports.initDatabase = initDatabase;
const closeDatabase = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    db = null;
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=database.js.map