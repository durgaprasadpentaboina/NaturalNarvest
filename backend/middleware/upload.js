import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpe?g|png|webp|avif)$/.test(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, 'Only JPG, PNG, WebP or AVIF images are allowed.'));
};

export default multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 8 } });
