import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

export class UserService {
  // Create new user with hashed password
  async create(data: CreateUserDTO): Promise<User> {
    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email.toLowerCase());

    if (existing) {
      throw new Error('Email already registered');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const userId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(userId, data.email.toLowerCase(), data.name, passwordHash, 'user', 0, now, now);

    return {
      id: userId,
      email: data.email.toLowerCase(),
      name: data.name,
      password_hash: passwordHash,
      role: 'user',
      is_verified: false,
      created_at: now,
      updated_at: now
    };
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const row: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    return row ? this.mapRowToUser(row) : null;
  }

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    const row: any = db.prepare(
      'SELECT id, email, name, role, is_verified, created_at, updated_at FROM users WHERE id = ?'
    ).get(id);
    return row ? this.mapRowToUser(row) : null;
  }

  // Verify password
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  // Mark email as verified
  async markEmailVerified(userId: string): Promise<void> {
    db.prepare('UPDATE users SET is_verified = 1, updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), userId);
  }

  // Update password
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, new Date().toISOString(), userId);
  }

  // Delete user (soft delete recommended for production)
  async delete(userId: string): Promise<void> {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  }

  // Get all users (admin only - add pagination in production)
  async getAll(limit: number = 20, offset: number = 0): Promise<User[]> {
    const rows: any[] = db.prepare(
      'SELECT id, email, name, role, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);
    return rows.map(row => this.mapRowToUser(row));
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password_hash: row.password_hash || '',
      role: row.role,
      is_verified: !!row.is_verified,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

// Export singleton instance
export const userService = new UserService();
