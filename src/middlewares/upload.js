import multer from 'multer';
import createHttpError from 'http-errors';
import { TEMP_UPLOADS_DIR } from '../constants/index.js';

const storage = multer.diskStorage({
  destination: TEMP_UPLOADS_DIR,
  filename: (req, file, cb) => {
    const uniquePreffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const fileName = `${uniquePreffix}_${file.originalname}`;
    cb(null, fileName);
  },
});

const limits = {
  fieldSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, cb) => {
  const extention = file.originalname.split('.').pop();
  if (extention === 'exe') {
    return cb(
      createHttpError(400, 'A file with the extension .exe cannot be saved.'),
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits,
  fileFilter,
});
