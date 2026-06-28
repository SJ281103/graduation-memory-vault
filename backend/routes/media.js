const router = require('express').Router();
const { uploadImage, uploadVideo, uploadToCloudinary, cloudinary } = require('../config/cloudinary');
const auth = require('../middleware/auth');

// POST /api/media/image
router.post('/image', uploadImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'graduation-vault/images' });
    res.json({ url: result.url, publicId: result.publicId });
  } catch {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/media/video
router.post('/video', uploadVideo.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'graduation-vault/videos', resource_type: 'video' });
    res.json({ url: result.url, publicId: result.publicId });
  } catch {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// DELETE /api/media/:publicId (admin only)
router.delete('/:publicId', auth, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;