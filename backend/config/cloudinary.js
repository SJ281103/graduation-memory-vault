const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'graduation-vault/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'graduation-vault/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'graduation-vault/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

const uploadImage  = multer({ storage: imageStorage,  limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVideo  = multer({ storage: videoStorage,  limits: { fileSize: 100 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5  * 1024 * 1024 } });

const uploadFields = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'bestPhoto', maxCount: 1 },
  { name: 'currentPhoto', maxCount: 1 },
]);

module.exports = { cloudinary, uploadImage, uploadVideo, uploadAvatar, uploadFields };
