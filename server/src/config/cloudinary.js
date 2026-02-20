import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

let _configured = false;

function ensureConfigured() {
  if (_configured) return true;

  const hasCredentials = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (hasCredentials) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    _configured = true;
  }

  return hasCredentials;
}

/**
 * Whether Cloudinary is configured (lazy check).
 */
export function cloudinaryEnabled() {
  return ensureConfigured();
}

/**
 * Upload a file to Cloudinary.
 * @param {string} filePath - Local path to the file
 * @param {string} folder - Cloudinary folder (e.g. 'flowbites/images')
 * @returns {{ public_id: string, secure_url: string } | null}
 */
export async function uploadToCloudinary(filePath, folder = 'flowbites') {
  if (!ensureConfigured()) return null;

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
  };
}

/**
 * Delete a file from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(publicId) {
  if (!ensureConfigured()) return null;
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Upload and clean up: uploads to Cloudinary then removes the local temp file.
 * Returns the secure_url, or null if Cloudinary is not configured.
 */
export async function uploadAndCleanup(filePath, folder = 'flowbites') {
  const result = await uploadToCloudinary(filePath, folder);
  if (result) {
    await fs.unlink(filePath).catch(() => {});
    return result.secure_url;
  }
  return null;
}

export default cloudinary;
