const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { TimeCapsule } = require('../models/extras');
const auth = require('../middleware/auth');

router.post('/', [
  body('authorName').trim().notEmpty(),
  body('message').trim().notEmpty().isLength({ max: 3000 }),
  body('unlockDate').isISO8601().toDate(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    // Minimum 1 month in the future
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() + 1);
    if (new Date(req.body.unlockDate) < minDate) {
      return res.status(400).json({ error: 'Unlock date must be at least 1 month in the future' });
    }
    const capsule = new TimeCapsule(req.body);
    await capsule.save();
    res.status(201).json({ message: 'Time capsule sealed! ⏰', id: capsule._id });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    // Auto-unlock expired capsules
    await TimeCapsule.updateMany(
      { isUnlocked: false, unlockDate: { $lte: new Date() } },
      { isUnlocked: true }
    );
    const capsules = await TimeCapsule.find({ status: 'approved' })
      .sort({ createdAt: -1 });
    // Hide message if not yet unlocked
    const sanitized = capsules.map(c => ({
      _id: c._id,
      authorName: c.authorName,
      unlockDate: c.unlockDate,
      isUnlocked: c.isUnlocked,
      hint: c.hint,
      message: c.isUnlocked ? c.message : null,
      createdAt: c.createdAt,
    }));
    res.json(sanitized);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/all', auth, async (req, res) => {
  try {
    const capsules = await TimeCapsule.find().sort({ createdAt: -1 });
    res.json(capsules);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/admin/:id', auth, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(capsule);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
