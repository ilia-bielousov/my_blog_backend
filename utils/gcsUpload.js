// utils/gcsUpload.js
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Настройка путей для ES Modules (__dirname не работает по умолчанию)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = new Storage({
  keyFilename: path.join(__dirname, '../gcs-key.json'), // Путь к ключу
});

const bucketName = 'blog-img-bucket'; // ТВОЙ БАКЕТ
const bucket = storage.bucket(bucketName);

const multerStorage = multer.memoryStorage();

// Экспортируем настроенный multer
export const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // Лимит 10MB
});

// Экспортируем функцию загрузки
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