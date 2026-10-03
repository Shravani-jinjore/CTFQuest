const request = require('supertest');
const crypto = require('crypto');
const app = require('../src/app');
const pool = require('../src/db');

const unique = Date.now();
const FLAG = 'CTFQUEST{jest_flag}';
let token;
let userId;
let challengeId;

beforeAll(async () => {
  const [[row]] = await pool.query('SELECT DATABASE() AS db');
  if (row.db !== 'ctfquest_test') {
    throw new Error(`Refusing to run tests on database "${row.db}"`);
  }

  const user = {
    username: `jest_c_${unique}`,
    email: `jest_c_${unique}@example.com`,
    password: 'password1234',
  };
  await request(app).post('/api/auth/register').send(user);
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  token = login.body.token;
  userId = (await pool.query('SELECT id FROM users WHERE email = ?', [user.email]))[0][0].id;

  const [result] = await pool.query(
    `INSERT INTO challenges (category_id, title, description, difficulty, xp_reward, flag_hash)
     SELECT id, ?, 'test', 'easy', 50, ? FROM categories LIMIT 1`,
    [`jest_challenge_${unique}`, crypto.createHash('sha256').update(FLAG).digest('hex')]
  );
  challengeId = result.insertId;
    if (!challengeId) throw new Error('Test challenge was not created (are categories seeded?)');
  await pool.query('INSERT INTO hints (challenge_id, level, content) VALUES (?, 1, ?)', [challengeId, 'h1']);
});

afterAll(async () => {
  await pool.query('DELETE FROM user_badges WHERE user_id = ?', [userId]);
  await pool.query('DELETE FROM hint_usage WHERE challenge_id = ?', [challengeId]);
  await pool.query('DELETE FROM hints WHERE challenge_id = ?', [challengeId]);
  await pool.query('DELETE FROM attempts WHERE challenge_id = ?', [challengeId]);
  await pool.query('DELETE FROM completions WHERE challenge_id = ?', [challengeId]);
  await pool.query('DELETE FROM challenges WHERE id = ?', [challengeId]);
  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  await pool.end();
});

const submit = (flag) =>
  request(app)
    .post(`/api/challenges/${challengeId}/submit`)
    .set('Authorization', `Bearer ${token}`)
    .send({ flag });

test('the challenge list never exposes flag_hash', async () => {
  const res = await request(app).get('/api/challenges');
  expect(res.status).toBe(200);
  expect(JSON.stringify(res.body)).not.toContain('flag_hash');
});

test('submit without a token gives 401', async () => {
  const res = await request(app).post(`/api/challenges/${challengeId}/submit`).send({ flag: 'x' });
  expect(res.status).toBe(401);
});

test('a wrong flag is rejected and gives no XP', async () => {
  const res = await submit('CTFQUEST{wrong}');
  expect(res.status).toBe(200);
  expect(res.body.correct).toBe(false);
  const [[u]] = await pool.query('SELECT xp FROM users WHERE id = ?', [userId]);
  expect(u.xp).toBe(0);
});

test('using one hint cuts the reward by 10%', async () => {
  const hint = await request(app)
    .post(`/api/challenges/${challengeId}/hints/next`)
    .set('Authorization', `Bearer ${token}`);
  expect(hint.status).toBe(200);

  const res = await submit(FLAG);
  expect(res.body.correct).toBe(true);
  expect(res.body.xp_awarded).toBe(45);
});

test('the same challenge cannot be completed twice', async () => {
  const res = await submit(FLAG);
  expect(res.status).toBe(409);
  const [[u]] = await pool.query('SELECT xp FROM users WHERE id = ?', [userId]);
  expect(u.xp).toBe(45);
});

test('a normal user cannot use admin routes', async () => {
  const res = await request(app)
    .post('/api/admin/challenges')
    .set('Authorization', `Bearer ${token}`)
    .send({});
  expect(res.status).toBe(403);
});