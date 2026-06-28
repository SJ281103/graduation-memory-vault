const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — file sits in RAM buffer, we manually stream to Cloudinary
const memStorage = multer.memoryStorage();

const uploadImage  = multer({ storage: memStorage, limits: { fileSize: 10  * 1024 * 1024 } });
const uploadVideo  = multer({ storage: memStorage, limits: { fileSize: 100 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: memStorage, limits: { fileSize: 5   * 1024 * 1024 } });

const uploadFields = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'bestPhoto',    maxCount: 1 },
  { name: 'currentPhoto', maxCount: 1 },
]);

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer  - file buffer from multer memoryStorage
 * @param {object} options - cloudinary upload options
 * @returns {Promise<{url, publicId}>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
};

module.exports = { cloudinary, uploadImage, uploadVideo, uploadAvatar, uploadFields, uploadToCloudinary };