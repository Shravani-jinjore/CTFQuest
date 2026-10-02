const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();
router.use(requireAuth, requireAdmin);

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

router.post('/challenges', async (req, res) => {
  const { category_id, title, description, difficulty, xp_reward, flag, docker_image } = req.body;

  if (!Number.isInteger(category_id) || !title || !description || !flag ||
      !DIFFICULTIES.includes(difficulty) || !Number.isInteger(xp_reward) || xp_reward <= 0) {
    return res.status(400).json({ error: 'invalid challenge data' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO challenges
         (category_id, title, description, difficulty, xp_reward, flag_hash, docker_image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id, title, description, difficulty, xp_reward, sha256(flag.trim()), docker_image || null]
    );
    res.status(201).json({ id: result.insertId, title });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'category does not exist' });
    }
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.put('/challenges/:id', async (req, res) => {
  const { title, description, difficulty, xp_reward, flag, docker_image } = req.body;

  if (difficulty !== undefined && !DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: 'invalid difficulty' });
  }
  if (xp_reward !== undefined && (!Number.isInteger(xp_reward) || xp_reward <= 0)) {
    return res.status(400).json({ error: 'invalid xp_reward' });
  }

  const fields = [];
  const values = [];
  if (title) { fields.push('title = ?'); values.push(title); }
  if (description) { fields.push('description = ?'); values.push(description); }
  if (difficulty) { fields.push('difficulty = ?'); values.push(difficulty); }
  if (xp_reward) { fields.push('xp_reward = ?'); values.push(xp_reward); }
  if (flag) { fields.push('flag_hash = ?'); values.push(sha256(flag.trim())); }
  if (docker_image !== undefined) { fields.push('docker_image = ?'); values.push(docker_image || null); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'nothing to update' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE challenges SET ${fields.join(', ')} WHERE id = ?`,
      [...values, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'challenge not found' });
    }
    res.json({ status: 'updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.delete('/challenges/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const table of ['hint_usage', 'hints', 'attempts', 'completions']) {
      await conn.query(`DELETE FROM ${table} WHERE challenge_id = ?`, [req.params.id]);
    }
    const [result] = await conn.query('DELETE FROM challenges WHERE id = ?', [req.params.id]);
    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'challenge not found' });
    }
    res.json({ status: 'deleted' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;