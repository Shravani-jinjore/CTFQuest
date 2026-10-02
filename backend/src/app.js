const pool = require('./db');
const authRoutes = require('./routes/auth');
const badgeRoutes = require('./routes/badges');
const learningRoutes = require('./routes/learning');
const challengeRoutes = require('./routes/challenges');
const leaderboardRoutes = require('./routes/leaderboard');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use('/api/badges', badgeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', learningRoutes);
app.use('/api/challenges', challengeRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CTFQuest backend is running' });
});

app.get('/api/hello/:name', (req, res) => {
  res.json({ greeting: `Hello, ${req.params.name}!` });
});
app.get('/api/categories', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name FROM categories');
  res.json(rows);
});
module.exports = app;