const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { Guestbook } = require('../models/extras');
const auth = require('../middleware/auth');

router.post('/', [
  body('signerName').trim().notEmpty(),
  body('message').trim().notEmpty().isLength({ max: 500 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const entry = new Guestbook(req.body);
    await entry.save();
    res.status(201).json({ message: 'Signed! ✍️' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const entries = await Guestbook.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(100);
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/admin/:id', auth, async (req, res) => {
  try {
    const entry = await Guestbook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
