import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = new Storage({
  keyFilename: path.join(__dirname, '../gcs-key.json'),
});

const bucketName = 'blog-img-bucket';
const bucket = storage.bucket(bucketName);

const multerStorage = multer.memoryStorage();

export const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadImageToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) reject('Файл не найден');

    const newFileName = `blog_${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
    const fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    blobStream.on('error', (error) => reject(error));

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${newFileName}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};