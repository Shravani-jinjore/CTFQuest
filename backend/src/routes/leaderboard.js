const express = require('express');
const pool = require('../db');
const { levelInfo } = require('../gamification');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.xp, COUNT(c.id) AS solved
       FROM users u
       LEFT JOIN completions c ON c.user_id = u.id
       GROUP BY u.id, u.username, u.xp
       ORDER BY u.xp DESC, u.username
       LIMIT 10`
    );
    res.json(rows.map((r) => ({ ...r, level: levelInfo(r.xp).level })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;