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
      `SELECT l.id, l.topic_id, l.title, l.content, l.position,
              t.title AS topic_title, t.category_id, c.name AS category_name
       FROM lessons l
       JOIN topics t ON l.topic_id = t.id
       JOIN categories c ON t.category_id = c.id
       WHERE l.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'lesson not found' });
    }
    const current = rows[0];

    const [trackLessons] = await pool.query(
      `SELECT l.id, l.title, l.topic_id, t.title AS topic_title
       FROM lessons l
       JOIN topics t ON l.topic_id = t.id
       WHERE t.category_id = ?
       ORDER BY t.position ASC, l.position ASC, l.id ASC`,
      [current.category_id]
    );

    const index = trackLessons.findIndex((l) => l.id === current.id);
    const prev = index > 0 ? trackLessons[index - 1] : null;
    const next = index !== -1 && index < trackLessons.length - 1 ? trackLessons[index + 1] : null;

    res.json({
      ...current,
      prev_id: prev ? prev.id : null,
      prev_title: prev ? prev.title : null,
      next_id: next ? next.id : null,
      next_title: next ? next.title : null,
      current_index: index + 1,
      total_in_track: trackLessons.length,
      track_lessons: trackLessons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;