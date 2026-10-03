const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

const unique = Date.now();
const user = {
  username: `jest_${unique}`,
  email: `jest_${unique}@example.com`,
  password: 'password1234',
};

beforeAll(async () => {
  const [[row]] = await pool.query('SELECT DATABASE() AS db');
  if (row.db !== 'ctfquest_test') {
    throw new Error(`Refusing to run tests on database "${row.db}"`);
  }
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE username LIKE 'jest_%'");
  await pool.end();
});

test('register creates a user', async () => {
  const res = await request(app).post('/api/auth/register').send(user);
  expect(res.status).toBe(201);
  expect(res.body.username).toBe(user.username);
  expect(res.body.password_hash).toBeUndefined();
});

test('registering the same user again gives 409', async () => {
  const res = await request(app).post('/api/auth/register').send(user);
  expect(res.status).toBe(409);
});

test('a short password gives 400', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ ...user, username: 'jest_short', password: '123' });
  expect(res.status).toBe(400);
});

test('login with a wrong password gives 401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'wrongpassword' });
  expect(res.status).toBe(401);
});

test('login works and the token opens /me', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  expect(login.status).toBe(200);
  expect(login.body.token).toBeDefined();

  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${login.body.token}`);
  expect(me.status).toBe(200);
  expect(me.body.username).toBe(user.username);
});

test('/me without a token gives 401', async () => {
  const res = await request(app).get('/api/auth/me');
  expect(res.status).toBe(401);
});