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

test('next level cannot be accessed or submitted unless prelevel is completed', async () => {
  const FLAG2 = 'CTFQUEST{jest_flag_2}';
  const [result2] = await pool.query(
    `INSERT INTO challenges (category_id, title, description, difficulty, xp_reward, flag_hash)
     SELECT category_id, 'jest_level_2', 'test 2', 'medium', 60, ? FROM challenges WHERE id = ?`,
    [crypto.createHash('sha256').update(FLAG2).digest('hex'), challengeId]
  );
  const challengeId2 = result2.insertId;

  // Create a brand new user who has NOT completed challengeId (level 1)
  const newUser = {
    username: `jest_fresh_${Date.now()}`,
    email: `jest_fresh_${Date.now()}@example.com`,
    password: 'password1234',
  };
  await request(app).post('/api/auth/register').send(newUser);
  const loginRes = await request(app).post('/api/auth/login').send({
    email: newUser.email,
    password: newUser.password,
  });
  const freshToken = loginRes.body.token;
  const freshUserId = loginRes.body.user.id;

  try {
    // 1. Fresh user views challenge 2 -> should be locked
    const viewRes = await request(app)
      .get(`/api/challenges/${challengeId2}`)
      .set('Authorization', `Bearer ${freshToken}`);
    expect(viewRes.status).toBe(200);
    expect(viewRes.body.locked).toBe(true);

    // 2. Fresh user tries to submit to challenge 2 before completing challenge 1 -> 403 Forbidden
    const subRes = await request(app)
      .post(`/api/challenges/${challengeId2}/submit`)
      .set('Authorization', `Bearer ${freshToken}`)
      .send({ flag: FLAG2 });
    expect(subRes.status).toBe(403);
    expect(subRes.body.error).toContain('Level locked');

    // 3. Fresh user completes prelevel (challenge 1)
    const solve1 = await request(app)
      .post(`/api/challenges/${challengeId}/submit`)
      .set('Authorization', `Bearer ${freshToken}`)
      .send({ flag: FLAG });
    expect(solve1.status).toBe(200);
    expect(solve1.body.correct).toBe(true);

    // 4. Now challenge 2 is unlocked
    const viewResAfter = await request(app)
      .get(`/api/challenges/${challengeId2}`)
      .set('Authorization', `Bearer ${freshToken}`);
    expect(viewResAfter.status).toBe(200);
    expect(viewResAfter.body.locked).toBe(false);

    // 5. Now fresh user can submit to challenge 2
    const solve2 = await request(app)
      .post(`/api/challenges/${challengeId2}/submit`)
      .set('Authorization', `Bearer ${freshToken}`)
      .send({ flag: FLAG2 });
    expect(solve2.status).toBe(200);
    expect(solve2.body.correct).toBe(true);
  } finally {
    await pool.query('DELETE FROM user_badges WHERE user_id = ?', [freshUserId]);
    await pool.query('DELETE FROM completions WHERE challenge_id = ?', [challengeId2]);
    await pool.query('DELETE FROM attempts WHERE challenge_id = ?', [challengeId2]);
    await pool.query('DELETE FROM challenges WHERE id = ?', [challengeId2]);
    await pool.query('DELETE FROM completions WHERE user_id = ?', [freshUserId]);
    await pool.query('DELETE FROM attempts WHERE user_id = ?', [freshUserId]);
    await pool.query('DELETE FROM users WHERE id = ?', [freshUserId]);
  }
});