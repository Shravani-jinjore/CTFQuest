const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/categories/:id/topics', async (req, res) => {
  try {
    const [topics] = await pool.query(
      'SELECT id, title, position FROM topics WHERE category_id = ? ORDER BY position',
      [req.params.id]
    );
    const [lessons] = await pool.query(
      `SELECT l.id, l.topic_id, l.title, l.position
       FROM lessons l JOIN topics t ON l.topic_id = t.id
       WHERE t.category_id = ?
       ORDER BY l.position`,
      [req.params.id]
    );

    const result = topics.map((topic) => ({
      ...topic,
      lessons: lessons.filter((l) => l.topic_id === topic.id),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/lessons/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, topic_id, title, content, position FROM lessons WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'lesson not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;