const router = require('express').Router();
const { body, validationResult, query } = require('express-validator');
const FriendMemory = require('../models/FriendMemory');
const auth = require('../middleware/auth');
const { uploadFields, uploadToCloudinary, cloudinary } = require('../config/cloudinary');

// POST /api/memories
router.post('/', uploadFields, [
  body('fullName').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('friendshipRating').optional().isInt({ min: 1, max: 10 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const data = { ...req.body, ipAddress: req.ip };

    // Upload bestPhoto if provided
    if (req.files?.bestPhoto?.[0]) {
      const result = await uploadToCloudinary(req.files.bestPhoto[0].buffer, {
        folder: 'graduation-vault/images',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
      });
      data.bestPhotoUrl      = result.url;
      data.bestPhotoPublicId = result.publicId;
    }

    // Upload currentPhoto if provided
    if (req.files?.currentPhoto?.[0]) {
      const result = await uploadToCloudinary(req.files.currentPhoto[0].buffer, {
        folder: 'graduation-vault/images',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
      });
      data.currentPhotoUrl      = result.url;
      data.currentPhotoPublicId = result.publicId;
    }

    const memory = new FriendMemory(data);
    await memory.save();
    res.status(201).json({ message: 'Memory saved! 🎓', memory: { _id: memory._id, fullName: memory.fullName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save memory' });
  }
});

// GET /api/memories
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('featured').optional().isBoolean(),
], async (req, res) => {
  const page    = parseInt(req.query.page)  || 1;
  const limit   = parseInt(req.query.limit) || 12;
  const skip    = (page - 1) * limit;
  const search  = req.query.search;
  const featured = req.query.featured;

  const filter = { status: 'approved' };
  if (featured === 'true') filter.featured = true;
  if (search) filter.$text = { $search: search };

  try {
    const [memories, total] = await Promise.all([
      FriendMemory.find(filter)
        .sort({ featured: -1, likes: -1, submittedAt: -1 })
        .skip(skip).limit(limit)
        .select('-ipAddress -likedBy'),
      FriendMemory.countDocuments(filter),
    ]);
    res.json({ memories, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// GET /api/memories/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, featured] = await Promise.all([
      FriendMemory.countDocuments({ status: 'approved' }),
      FriendMemory.countDocuments({ status: 'approved', featured: true }),
    ]);
    const avgRating = await FriendMemory.aggregate([
      { $match: { status: 'approved', friendshipRating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$friendshipRating' } } },
    ]);
    res.json({ total, friends: total, featured, avgRating: avgRating[0]?.avg?.toFixed(1) || 0 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/memories/:id/like
router.post('/:id/like', async (req, res) => {
  try {
    const ip     = req.ip;
    const memory = await FriendMemory.findById(req.params.id);
    if (!memory) return res.status(404).json({ error: 'Memory not found' });
    const idx = memory.likedBy.indexOf(ip);
    if (idx > -1) { memory.likedBy.splice(idx, 1); memory.likes = Math.max(0, memory.likes - 1); }
    else          { memory.likedBy.push(ip); memory.likes += 1; }
    await memory.save();
    res.json({ likes: memory.likes, liked: idx === -1 });
  } catch {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// POST /api/memories/:id/comment
router.post('/:id/comment', [
  body('text').trim().notEmpty().isLength({ max: 500 }),
  body('authorName').trim().notEmpty().isLength({ max: 100 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const memory = await FriendMemory.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text: req.body.text, authorName: req.body.authorName } } },
      { new: true }
    );
    if (!memory) return res.status(404).json({ error: 'Memory not found' });
    res.json({ message: 'Comment added', comments: memory.comments });
  } catch {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ADMIN — get all
router.get('/admin/all', auth, async (req, res) => {
  try {
    const memories = await FriendMemory.find().sort({ submittedAt: -1 });
    res.json(memories);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN — update status/featured
router.patch('/admin/:id/status', auth, async (req, res) => {
  try {
    const { status, featured } = req.body;
    const memory = await FriendMemory.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(featured !== undefined && { featured }) },
      { new: true }
    );
    res.json(memory);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN — delete
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const memory = await FriendMemory.findById(req.params.id);
    if (!memory) return res.status(404).json({ error: 'Not found' });
    const deletes = [];
    if (memory.bestPhotoPublicId)    deletes.push(cloudinary.uploader.destroy(memory.bestPhotoPublicId));
    if (memory.currentPhotoPublicId) deletes.push(cloudinary.uploader.destroy(memory.currentPhotoPublicId));
    if (memory.videoPublicId)        deletes.push(cloudinary.uploader.destroy(memory.videoPublicId, { resource_type: 'video' }));
    await Promise.all(deletes);
    await memory.deleteOne();
    res.json({ message: 'Memory deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;