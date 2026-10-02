const pool = require('../db');

async function requireAdmin(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0] || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'admin only' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = requireAdmin;