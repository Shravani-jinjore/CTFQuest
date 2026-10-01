const pool = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

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