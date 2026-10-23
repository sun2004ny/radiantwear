import { v2 as cloudinary } from 'cloudinary';

/**
 * Check if Cloudinary is configured via environment variables.
 * Supports CLOUDINARY_URL or individual credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
 */
export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

/**
 * Initialize Cloudinary configuration on demand.
 */
function ensureCloudinaryConfig() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ url: process.env.CLOUDINARY_URL });
  } else if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }
}

/**
 * Upload an image to Cloudinary during the final submit phase.
 * If Cloudinary is configured:
 *   - Uploads to folder 'radiantwears/products'
 *   - Returns secure URL and public_id (for rollback if needed)
 * If Cloudinary is not yet configured:
 *   - Keeps integration ready and returns the prepared image data/URL
 *   - Logs an informational note for the admin
 * 
 * @param {string} imageData - Base64 data URI or image URL
 * @param {object} options - Optional upload settings (folder, tags, etc.)
 * @returns {Promise<{ url: string, publicId: string|null, isCloudinary: boolean }>}
 */
export async function uploadProductImage(imageData, options = {}) {
  if (!imageData || typeof imageData !== 'string' || !imageData.trim()) {
    throw new Error('Image data is required.');
  }

  // 1. If Cloudinary credentials are provided, perform real Cloudinary upload
  if (isCloudinaryConfigured()) {
    ensureCloudinaryConfig();
    try {
      const uploadOptions = {
        folder: options.folder || 'radiantwears/products',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ],
        ...options
      };

      const result = await cloudinary.uploader.upload(imageData, uploadOptions);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        isCloudinary: true
      };
    } catch (err) {
      console.error('[Cloudinary Upload Error]', err);
      throw new Error(`Failed to upload image to Cloudinary: ${err.message || 'Unknown error'}`);
    }
  }

  // 2. Fallback when Cloudinary credentials are not yet set
  // This allows the product workflow to work seamlessly right now.
  console.log('[Image Service] Cloudinary credentials not yet configured in .env. Using prepared image data.');
  return {
    url: imageData,
    publicId: null,
    isCloudinary: false
  };
}

/**
 * Rollback Cloudinary upload if subsequent database operations fail.
 * Prevents orphaned images in Cloudinary.
 * 
 * @param {string|null} publicId - The Cloudinary public_id returned during upload
 */
export async function rollbackProductImage(publicId) {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    ensureCloudinaryConfig();
    await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary Rollback] Successfully removed orphaned image: ${publicId}`);
  } catch (err) {
    console.error(`[Cloudinary Rollback Error] Could not remove image ${publicId}:`, err);
  }
}
