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

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '.zip,.jpg,.jpeg,.png,.gif,.webp,.svg').split(',');
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
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
