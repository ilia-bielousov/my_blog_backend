import express from "express";
import cors from 'cors';
import mongoose from "mongoose";

import { getHome, getDataForCards, getArticle } from "./controllers/clientController.js";
import { updateViewOfArticle, createCard, createArticle, getPreview, createPreview, patchPreview, deletePreview, getAllCards, getAllArticles, uploadImage, updateArticle, getArticleByCardId, getArticleForEdit, updateCard, getPreviewById } from './controllers/adminController.js';

import { upload } from './utils/gcsUpload.js';

const port = process.env.PORT || 4000;
const app = express();
const URL = 'mongodb+srv://admin:admin@cluster0.smbdm01.mongodb.net/';

mongoose.connect(URL)
  .then(() => console.log('db ok'))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.set('etag', false);

// для клиента
app.get('/', getHome);
app.get('/:id', getDataForCards);
app.get('/programming/:id', getArticle);
app.get('/projects/:id', getArticle);
app.get('/modeling/:id', getArticle);

// для обновления количества просмотров
app.patch('/programming/:id', updateViewOfArticle);
app.patch('/projects/:id', updateViewOfArticle);
app.patch('/modeling/:id', updateViewOfArticle);

// для админа
app.get('/admin/getAllCards', getAllCards);
app.get('/admin/getAllArticles', getAllArticles);
app.post('/admin/create-card', createCard);
app.get('/admin/article-by-card/:cardId', getArticleByCardId);
app.post('/admin/create-article', createArticle);
app.post('/admin/upload', upload.single('file'), uploadImage);
app.get('/admin/edit-article/:id', getArticleForEdit);
app.patch('/admin/edit-article', updateArticle);
app.patch('/admin/edit-card', updateCard);

app.get('/admin/preview', getPreview);
app.get('/admin/preview/:id', getPreviewById);
app.post('/admin/preview', createPreview);
app.patch('/admin/preview', patchPreview);
app.delete('/admin/preview/:id', deletePreview);

// для редактирования статьи
app.get('/admin/edit-article/:id', getArticle);

app.patch('/admin/edit-article', updateArticle);

app.listen(port, () => {
  try {
    console.log('server OK');
  } catch (err) {
    console.log(err);
  }
});

