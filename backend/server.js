const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── Security Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Rate Limiting ────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many submissions, please try again later.' },
});
app.use('/api/', limiter);
app.use('/api/memories', strictLimiter);
app.use('/api/teachers', strictLimiter);

// ── Database Connection ──────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/memories',  require('./routes/memories'));
app.use('/api/teachers',  require('./routes/teachers'));
app.use('/api/media',     require('./routes/media'));
app.use('/api/reactions', require('./routes/reactions'));
app.use('/api/guestbook', require('./routes/guestbook'));
app.use('/api/capsule',   require('./routes/timeCapsule'));
app.use('/api/admin',     require('./routes/admin'));

// ── Health Check ─────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
