const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const TeacherMemory = require('../models/TeacherMemory');
const auth = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

// POST /api/teachers
router.post('/', uploadAvatar.single('photo'), [
  body('teacherName').trim().notEmpty().withMessage('Teacher name required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const data = { ...req.body };
    if (req.file) {
      data.photoUrl      = req.file.path;
      data.photoPublicId = req.file.filename;
    }
    const teacher = new TeacherMemory(data);
    await teacher.save();
    res.status(201).json({ message: 'Thank you for your blessing! 🙏', teacher: { _id: teacher._id } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save teacher memory' });
  }
});

// GET /api/teachers (public, approved only)
router.get('/', async (req, res) => {
  try {
    const teachers = await TeacherMemory.find({ status: 'approved' })
      .sort({ featured: -1, submittedAt: -1 });
    res.json(teachers);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/:id/like
router.post('/:id/like', async (req, res) => {
  try {
    const teacher = await TeacherMemory.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json({ likes: teacher.likes });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN
router.get('/admin/all', auth, async (req, res) => {
  try {
    const teachers = await TeacherMemory.find().sort({ submittedAt: -1 });
    res.json(teachers);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/admin/:id/status', auth, async (req, res) => {
  try {
    const teacher = await TeacherMemory.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json(teacher);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/admin/:id', auth, async (req, res) => {
  try {
    await TeacherMemory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
