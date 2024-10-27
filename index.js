import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import fileUpload from 'express-fileupload';

import { getHome, getDataForCards, getArticle, updateViewOfArticle, createCard, createArticle, getPreview, createPreview, patchPreview, deletePreview, getAllCards, getAllArticles, uploadImage, updateArticle, getImage } from './controller/controller.js';

const port = process.env.PORT || 4000;
const app = express();
const URL = 'mongodb+srv://admin:admin@cluster0.smbdm01.mongodb.net/';

mongoose.connect(URL)
  .then(() => console.log('db ok'))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());

// для клиента
app.get('/', getHome);
app.get('/:id', getDataForCards);
app.get('/programming/:id', getArticle);
app.get('/projects/:id', getArticle);
app.get('/modeling/:id', getArticle);

app.get('/upload/:id', getImage);

// для обновления количества просмотров
app.patch('/programming/:id', updateViewOfArticle);
app.patch('/projects/:id', updateViewOfArticle);
app.patch('/modeling/:id', updateViewOfArticle);

// для админа
app.get('/admin/getAllCards', getAllCards);
app.get('/admin/getAllArticles', getAllArticles);
app.post('/admin/create-card', createCard);
app.post('/admin/create-article', createArticle);
app.post('/admin/upload', uploadImage);

app.get('/admin/preview', getPreview);
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

