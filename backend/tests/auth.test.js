import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.js';
import { db } from '../src/db.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  // Ensure DB is connected
});

afterAll(async () => {
  await db.end();
});

describe('Auth API', () => {
  test('POST /api/auth/register - success', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('POST /api/auth/register - duplicate email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('User already exists');
  });

  test('POST /api/auth/login - success', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });
});