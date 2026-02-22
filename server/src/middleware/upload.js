import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const dirs = ['templates', 'images', 'shots', 'documents'];

dirs.forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'images';

    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      folder = 'templates';
    } else if (file.fieldname === 'shotImage') {
      folder = 'shots';
    } else if (['govIdFront', 'govIdBack', 'selfieWithId'].includes(file.fieldname)) {
      folder = 'documents';
    }

    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Map of allowed extensions to their valid MIME types
const ALLOWED_MIME_MAP = {
  '.zip': ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.svg': ['image/svg+xml'],
};

const fileFilter = (req, file, cb) => {
  const allowedExts = (process.env.ALLOWED_FILE_TYPES || '.zip,.jpg,.jpeg,.png,.gif,.webp,.svg').split(',');
  const ext = path.extname(file.originalname).toLowerCase();

  // Check extension is allowed
  if (!allowedExts.includes(ext)) {
    return cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedExts.join(', ')}`), false);
  }

  // Validate MIME type matches the extension (prevents disguised files)
  const validMimes = ALLOWED_MIME_MAP[ext];
  if (validMimes && !validMimes.includes(file.mimetype)) {
    return cb(new Error(`File MIME type ${file.mimetype} does not match extension ${ext}`), false);
  }

  // Restrict SVG uploads — SVG can contain embedded JS (XSS risk)
  // Only allow SVG for image display fields, not for template files or documents
  if (ext === '.svg' && ['templateFile', 'govIdFront', 'govIdBack', 'selfieWithId'].includes(file.fieldname)) {
    return cb(new Error('SVG files are not allowed for this field'), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
  }
});

// Named upload configurations
export const uploadTemplate = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 5 },
  { name: 'templateFile', maxCount: 1 }
]);

export const uploadShot = upload.single('shotImage');

export const uploadImages = upload.array('images', 10);

export const uploadOnboarding = upload.fields([
  { name: 'govIdFront', maxCount: 1 },
  { name: 'govIdBack', maxCount: 1 },
  { name: 'selfieWithId', maxCount: 1 }
]);
