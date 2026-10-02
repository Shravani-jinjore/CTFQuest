const { levelInfo } = require('../gamification');
const express = require('express');
const requireAuth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    res.status(201).json({ id: result.insertId, username, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'username or email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash, role FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, username, email, role, xp FROM users WHERE id = ?',
    [req.user.id]
  );
 res.json({ ...rows[0], ...levelInfo(rows[0].xp) });
});
module.exports = router;