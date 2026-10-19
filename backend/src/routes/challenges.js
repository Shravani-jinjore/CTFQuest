const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const { startChallenge, stopChallenge, TIMEOUT_MS } = require('../challengeManager');
const { awardBadges } = require('../gamification');
const requireAuth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const jwt = require('jsonwebtoken');

const router = express.Router();

function getOptionalUser(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function getChallengeLockStatus(db, userId, challengeId) {
  const [prevRows] = await db.query(
    'SELECT id, title FROM challenges WHERE id < ? ORDER BY id DESC LIMIT 1',
    [challengeId]
  );
  const prevChallenge = prevRows[0] || null;
  if (!prevChallenge) {
    return { locked: false, prevChallenge: null };
  }

  if (!userId) {
    return { locked: true, prevChallenge };
  }

  const [done] = await db.query(
    'SELECT challenge_id FROM completions WHERE user_id = ? AND challenge_id IN (?, ?)',
    [userId, challengeId, prevChallenge.id]
  );
  const doneIds = new Set(done.map((d) => d.challenge_id));
  const isUnlocked = doneIds.has(Number(challengeId)) || doneIds.has(prevChallenge.id);

  return {
    locked: !isUnlocked,
    prevChallenge,
  };
}

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyFn: (req) => `user-${req.user.id}`,
});

router.get('/', async (req, res) => {
  try {
    const [challenges] = await pool.query(
      `SELECT c.id, c.category_id, c.title, c.difficulty, c.xp_reward,
              (
                SELECT u.username
                FROM completions comp
                JOIN users u ON u.id = comp.user_id
                WHERE comp.challenge_id = c.id AND comp.is_first_blood = 1
                ORDER BY comp.id ASC
                LIMIT 1
              ) AS first_blood_user
       FROM challenges c
       ORDER BY c.id`
    );
    const user = getOptionalUser(req);
    let completedSet = new Set();
    if (user) {
      const [completions] = await pool.query(
        'SELECT challenge_id FROM completions WHERE user_id = ?',
        [user.id]
      );
      completedSet = new Set(completions.map((c) => c.challenge_id));
    }

    const result = challenges.map((c, index) => {
      const isFirst = index === 0;
      const prevChallenge = index > 0 ? challenges[index - 1] : null;
      const completed = completedSet.has(c.id);
      const prevCompleted = prevChallenge ? completedSet.has(prevChallenge.id) : true;
      const unlocked = isFirst || (user && (completed || prevCompleted));

      return {
        ...c,
        completed,
        locked: !unlocked,
        prev_id: prevChallenge ? prevChallenge.id : null,
        prev_title: prevChallenge ? prevChallenge.title : null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.category_id, c.title, c.description, c.difficulty, c.xp_reward,
              (
                SELECT u.username
                FROM completions comp
                JOIN users u ON u.id = comp.user_id
                WHERE comp.challenge_id = c.id AND comp.is_first_blood = 1
                ORDER BY comp.id ASC
                LIMIT 1
              ) AS first_blood_user
       FROM challenges c
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'challenge not found' });
    }
    const challenge = rows[0];
    const user = getOptionalUser(req);
    const lockStatus = await getChallengeLockStatus(pool, user?.id, challenge.id);

    let completed = false;
    if (user) {
      const [done] = await pool.query(
        'SELECT 1 FROM completions WHERE user_id = ? AND challenge_id = ?',
        [user.id, challenge.id]
      );
      completed = done.length > 0;
    }

    res.json({
      ...challenge,
      completed,
      locked: lockStatus.locked,
      prev_id: lockStatus.prevChallenge ? lockStatus.prevChallenge.id : null,
      prev_title: lockStatus.prevChallenge ? lockStatus.prevChallenge.title : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/:id/submit', requireAuth, submitLimiter, async (req, res) => {
  const { flag } = req.body;
  if (typeof flag !== 'string' || flag.trim() === '') {
    return res.status(400).json({ error: 'flag is required' });
  }

  const userId = req.user.id;
  const challengeId = req.params.id;
  const conn = await pool.getConnection();

  try {
    const lockStatus = await getChallengeLockStatus(conn, userId, challengeId);
    if (lockStatus.locked) {
      return res.status(403).json({
        error: `Level locked. You must complete the previous level ("${lockStatus.prevChallenge?.title}") first.`,
      });
    }

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

    // Each hint used reduces the reward by 10%
    const [usedRows] = await conn.query(
      'SELECT COUNT(*) AS n FROM hint_usage WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );
    const hintsUsed = usedRows[0].n;
    const xpAwarded = Math.floor((challenge.xp_reward * (10 - hintsUsed)) / 10);

    // First blood check: see if anyone completed this challenge before
    const [priorCompletions] = await conn.query(
      'SELECT id FROM completions WHERE challenge_id = ? LIMIT 1',
      [challengeId]
    );
    const isFirstBlood = priorCompletions.length === 0;

    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO completions (user_id, challenge_id, xp_awarded, is_first_blood) VALUES (?, ?, ?, ?)',
      [userId, challengeId, xpAwarded, isFirstBlood]
    );
    await conn.query(
      `UPDATE users SET
         xp = xp + ?,
         streak_days = CASE
           WHEN last_active = CURDATE() THEN streak_days
           WHEN last_active = CURDATE() - INTERVAL 1 DAY THEN streak_days + 1
           ELSE 1
         END,
         last_active = CURDATE()
       WHERE id = ?`,
      [xpAwarded, userId]
    );
    const badgesEarned = await awardBadges(conn, userId, {
      hintsUsed,
      challengeId: Number(challengeId),
      isFirstBlood,
    });
    await conn.commit();

    res.json({
      correct: true,
      xp_awarded: xpAwarded,
      first_blood: isFirstBlood,
      hints_used: hintsUsed,
      badges_earned: badgesEarned,
    });
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
    const lockStatus = await getChallengeLockStatus(pool, userId, challengeId);
    if (lockStatus.locked) {
      return res.status(403).json({
        error: `Level locked. You must complete the previous level ("${lockStatus.prevChallenge?.title}") first.`,
      });
    }

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
    const lockStatus = await getChallengeLockStatus(pool, req.user.id, req.params.id);
    if (lockStatus.locked) {
      return res.status(403).json({
        error: `Level locked. You must complete the previous level ("${lockStatus.prevChallenge?.title}") first.`,
      });
    }

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

router.post('/:id/start', requireAuth, async (req, res) => {
  try {
    const lockStatus = await getChallengeLockStatus(pool, req.user.id, req.params.id);
    if (lockStatus.locked) {
      return res.status(403).json({
        error: `Level locked. You must complete the previous level ("${lockStatus.prevChallenge?.title}") first.`,
      });
    }

    const [rows] = await pool.query(
      'SELECT docker_image FROM challenges WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'challenge not found' });
    }
    if (!rows[0].docker_image) {
      return res.status(400).json({ error: 'this challenge has no environment' });
    }

    await startChallenge(req.user.id, req.params.id, rows[0].docker_image);
    res.json({ status: 'running', expires_in_minutes: TIMEOUT_MS / 60000 });
  } catch (err) {
    if (err.code === 'LIMIT') {
      return res.status(429).json({ error: 'you already have 2 running challenges, stop one first' });
    }
    console.error(err);
    res.status(500).json({ error: 'could not start challenge' });
  }
});

router.post('/:id/stop', requireAuth, async (req, res) => {
  try {
    await stopChallenge(req.user.id, req.params.id);
    res.json({ status: 'stopped' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not stop challenge' });
  }
});

module.exports = router;