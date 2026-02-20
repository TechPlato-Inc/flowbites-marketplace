import { uploadAndCleanup, cloudinaryEnabled } from '../config/cloudinary.js';

// Fields that should NOT be uploaded to Cloudinary (stay on local disk)
const LOCAL_ONLY_FIELDS = new Set([
  'templateFile',
  'govIdFront',
  'govIdBack',
  'selfieWithId',
]);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);

function isImageFile(filename) {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function getFolderForField(fieldname) {
  if (fieldname === 'shotImage') return 'flowbites/shots';
  if (fieldname === 'coverImage') return 'flowbites/blog';
  if (fieldname === 'gallery') return 'flowbites/gallery';
  return 'flowbites/images';
}

/**
 * Middleware that uploads image files to Cloudinary after multer writes them to disk.
 * Replaces file.filename with the Cloudinary secure_url.
 * Skips ZIP files, document fields, and any non-image files.
 * If Cloudinary is not configured, passes through without changes.
 */
export async function cloudinaryUpload(req, res, next) {
  if (!cloudinaryEnabled()) return next();

  try {
    const filesToProcess = [];

    // Handle req.files (object of arrays from upload.fields())
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
      for (const [fieldname, files] of Object.entries(req.files)) {
        if (LOCAL_ONLY_FIELDS.has(fieldname)) continue;
        for (const file of files) {
          if (isImageFile(file.originalname)) {
            filesToProcess.push({ file, folder: getFolderForField(fieldname) });
          }
        }
      }
    }

    // Handle req.files (array from upload.array())
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        if (isImageFile(file.originalname)) {
          filesToProcess.push({ file, folder: 'flowbites/images' });
        }
      }
    }

    // Handle req.file (single file from upload.single())
    if (req.file && !LOCAL_ONLY_FIELDS.has(req.file.fieldname) && isImageFile(req.file.originalname)) {
      filesToProcess.push({ file: req.file, folder: getFolderForField(req.file.fieldname) });
    }

    // Upload all image files to Cloudinary in parallel
    await Promise.all(
      filesToProcess.map(async ({ file, folder }) => {
        const url = await uploadAndCleanup(file.path, folder);
        if (url) {
          file.filename = url;
        }
      })
    );

    next();
  } catch (error) {
    next(error);
  }
}
