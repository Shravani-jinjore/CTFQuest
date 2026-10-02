const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.code, b.name, b.description, ub.awarded_at
       FROM badges b
       LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = ?
       ORDER BY b.id`,
      [req.user.id]
    );
    res.json(rows.map((r) => ({ ...r, earned: r.awarded_at !== null })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;