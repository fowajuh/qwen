import { Pool } from 'pg';
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
  created_at: Date;
  updated_at: Date;
}

interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export class UserService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Create new user with hashed password
  async create(data: CreateUserDTO): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if email already exists
      const existing = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email]
      );

      if (existing.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      const userId = uuidv4();
      const now = new Date();

      const result = await client.query(
        `INSERT INTO users (id, email, name, password_hash, role, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, data.email, data.name, passwordHash, 'user', false, now, now]
      );

      await client.query('COMMIT');
      return result.rows[0] as User;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    return result.rows[0] || null;
  }

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT id, email, name, role, is_verified, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Verify password
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  // Mark email as verified
  async markEmailVerified(userId: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  // Update password
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
  }

  // Delete user (soft delete recommended for production)
  async delete(userId: string): Promise<void> {
    await this.pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
  }

  // Get all users (admin only - add pagination in production)
  async getAll(limit: number = 20, offset: number = 0): Promise<User[]> {
    const result = await this.pool.query(
      'SELECT id, email, name, role, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    return result.rows as User[];
  }
}

// Export singleton instance (in production, use dependency injection)
import { pool } from '../config/database.pg.js';
export const userService = new UserService(pool);
