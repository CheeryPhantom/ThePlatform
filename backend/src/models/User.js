import { db } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export class User {
  static async create({ email, password, name, role = 'candidate' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, passwordHash, name, role]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    return result.rows[0];
  }

  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}