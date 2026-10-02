const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, category_id, title, difficulty, xp_reward FROM challenges ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, category_id, title, description, difficulty, xp_reward FROM challenges WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'challenge not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/:id/submit', requireAuth, async (req, res) => {
  const { flag } = req.body;
  if (typeof flag !== 'string' || flag.trim() === '') {
    return res.status(400).json({ error: 'flag is required' });
  }

  const userId = req.user.id;
  const challengeId = req.params.id;
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query(
      'SELECT id, xp_reward, flag_hash FROM challenges WHERE id = ?',
      [challengeId]
    );
    const challenge = rows[0];
    if (!challenge) {
      return res.status(404).json({ error: 'challenge not found' });
    }

    const [done] = await conn.query(
      'SELECT id FROM completions WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );
    if (done.length > 0) {
      return res.status(409).json({ error: 'already completed' });
    }

    const guessHash = crypto.createHash('sha256').update(flag.trim()).digest('hex');
    const correct = guessHash === challenge.flag_hash;

    await conn.query(
      'INSERT INTO attempts (user_id, challenge_id, is_correct) VALUES (?, ?, ?)',
      [userId, challengeId, correct]
    );

    if (!correct) {
      return res.json({ correct: false, message: 'Wrong flag. Keep trying!' });
    }

    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO completions (user_id, challenge_id, xp_awarded) VALUES (?, ?, ?)',
      [userId, challengeId, challenge.xp_reward]
    );
    await conn.query('UPDATE users SET xp = xp + ? WHERE id = ?', [
      challenge.xp_reward,
      userId,
    ]);
    await conn.commit();

    res.json({ correct: true, xp_awarded: challenge.xp_reward });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'already completed' });
    }
    console.error(err);
    res.status(500).json({ error: 'server error' });
  } finally {
    conn.release();
  }
});
router.post('/:id/hints/next', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const challengeId = req.params.id;

  try {
    const [used] = await pool.query(
      'SELECT COALESCE(MAX(level), 0) AS last FROM hint_usage WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );
    const nextLevel = used[0].last + 1;

    const [rows] = await pool.query(
      'SELECT level, content FROM hints WHERE challenge_id = ? AND level = ?',
      [challengeId, nextLevel]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'no more hints' });
    }

    await pool.query(
      'INSERT INTO hint_usage (user_id, challenge_id, level) VALUES (?, ?, ?)',
      [userId, challengeId, nextLevel]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'hint already unlocked, try again' });
    }
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id/hints', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.level, h.content
       FROM hints h
       JOIN hint_usage u ON u.challenge_id = h.challenge_id AND u.level = h.level
       WHERE u.user_id = ? AND h.challenge_id = ?
       ORDER BY h.level`,
      [req.user.id, req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;