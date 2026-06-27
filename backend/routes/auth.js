const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const Admin  = require('../models/Admin');
const auth   = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});

// POST /api/auth/login
router.post('/login', loginLimiter, [
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await admin.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { name: admin.name, username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/setup  (first-time setup, disabled if admin exists)
router.post('/setup', async (req, res) => {
  try {
    const exists = await Admin.findOne();
    if (exists) return res.status(403).json({ error: 'Admin already configured' });

    const { username, password, name } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const admin = new Admin({ username, passwordHash: password, name: name || 'Admin' });
    await admin.save();
    res.status(201).json({ message: 'Admin account created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/verify
router.get('/verify', auth, (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

module.exports = router;
