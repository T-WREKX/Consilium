// apps/api/src/services/auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import { JWT_SECRET } from '../middleware/auth';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'lawyer' | 'practice_group_lead' | 'knowledge_admin';
}

export async function findUserByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null> {
  const result = await pool.query(
    'SELECT id, email, display_name, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    passwordHash: row.password_hash,
  };
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}
