import cloudinary, { configureCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ width: 1400, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// POST /api/uploads   multipart field "images" (up to 8). Returns only the hosted URLs.
export const uploadImages = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, 'Image uploads are not configured yet. Add the Cloudinary keys to the server environment, or paste image URLs instead.');
  }
  if (!req.files?.length) throw new ApiError(400, 'Choose at least one image to upload.');
  configureCloudinary();
  const results = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'naturalharvest/products')));
  res.status(201).json({ urls: results.map((r) => r.secure_url) });
});

export const uploadStatus = (req, res) => res.json({ enabled: isCloudinaryConfigured() });
