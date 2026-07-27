const request = require('supertest');
const app = require('../../app');

// These API tests assume a test database seeded with database/seeds/seed.sql
// is reachable via the .env used in the test environment (see .env.test.example).
describe('POST /api/auth/login', () => {
  test('rejects missing credentials with 422', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid credentials with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
  });
});
