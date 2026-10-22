const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const pool = require('./db');
const securityHeaders = require('./middleware/security');
const authRoutes = require('./routes/auth');
const learningRoutes = require('./routes/learning');
const challengeRoutes = require('./routes/challenges');
const leaderboardRoutes = require('./routes/leaderboard');
const badgeRoutes = require('./routes/badges');
const adminRoutes = require('./routes/admin');

const app = express();

app.disable('x-powered-by');
app.use(securityHeaders);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    const allowed = process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
    if (allowed.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for production deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CTFQuest backend is running' });
});

app.get('/api/hello/:name', (req, res) => {
  res.json({ greeting: `Hello, ${req.params.name}!` });
});


app.use('/api/auth', authRoutes);
app.use('/api', learningRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;