import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'investment-dashboard-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: number, username: string): string => {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: number; username: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
};

export const createUser = async (username: string, password: string): Promise<number> => {
  const db = getDb();
  const passwordHash = await hashPassword(password);
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as User || null);
        }
      }
    );
  });
};