// routes/media.js
const router = require('express').Router();
const { uploadImage, uploadVideo, cloudinary } = require('../config/cloudinary');
const auth = require('../middleware/auth');

// POST /api/media/image
router.post('/image', uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.path, publicId: req.file.filename });
});

// POST /api/media/video
router.post('/video', uploadVideo.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.path, publicId: req.file.filename });
});

// DELETE /api/media/:publicId  (admin only)
router.delete('/:publicId', auth, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
