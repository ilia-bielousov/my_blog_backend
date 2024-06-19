import commonjsVariables from 'commonjs-variables-for-esmodules';
import Article from '../Models/ArticleModel.js';
import Card from '../Models/CardModel.js';
import Image from '../Models/ImageModel.js';
import path from 'path';
import * as fs from 'fs';


const {
  __dirname,
} = commonjsVariables(import.meta);

const handleError = (res, error) => {
  res.status(500).json({ error });
}

async function getDataForCards(req, res) {
  try {
    await Card
      .find({ choose: req.params.id })
      .then((data) => {
        res.
          status(200)
          .json({ data, status: 200 });
      })
  } catch (err) {
    return res.status(500).json({ status: 500 });
  }
}

async function getArticle(req, res) {
  try {
    const card = await Card.find({ pseudoName: req.params.id });
    const article = await Article.find({ card: card[0]._id });

    res.status(200).json(article[0]);
  } catch (err) {
    res.status(404).json({ status: 404 });
  }
}

async function updateViewOfArticle(req, res) {
  try {
    const card = await Card.find({ pseudoName: req.params.id });

    await Article.find({ card: card[0]._id })
      .updateOne(
        { $inc: { views: 1 } }
      )
      .then(() => {
        res.status(200).json({ status: 200 })
      })
      .catch((err) => res.status(500).json({ status: 500 }));
  } catch (err) {
    res.status(404).json({ status: 404 })
  }
}

async function createCard(req, res) {
  const card = new Card({
    ...req.body
  });

  await card
    .save()
    .then((result) => {
      if (result) {
        res
          .status(200)
          .json({ id: result._id, status: 200 })
      } else {
        throw 'error';
      }
    })
    .catch(() => {
      res.status(500).json({ status: 500 })
    });
}

async function createArticle(req, res) {
  const ID = req.body.pop();

  const article = new Article({
    card: ID,
    content: [...req.body]
  });

  article
    .save()
    .then(() => {
      res
        .status(200).json({ status: 200 })
    })
    .catch(() => {
      return res.status(500).json({ status: 500 })
    });
}

async function getAllCards(req, res) {
  Card
    .find()
    .then((data) => {
      res.status(200)
        .json(data);
    })
    .catch((err) => handleError(res, err));
}

async function getAllArticles(req, res) {
  Article
    .find()
    .then((data) => {
      res.status(200)
        .json(data);
    })
    .catch((err) => handleError(res, err));
}

async function convertImageToBase64(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return data.toString('base64');
  } catch (err) {
    console.error('Error reading file:', err);
    throw err;
  }
}

async function getImage(req, res) {
  await Image.find({ imageUrl: req.params.id })
    .then((data) => {
      res.
        status(200)
        .json({ data, status: 200 });
    })
    .catch((err) => {
      res.
        status(500)
        .json({ status: 500 })
    })
}

async function saveTheImage(res, imageBase64, myFile) {
  const card = new Image({
    imageSource: imageBase64,
    imageUrl: myFile
  });

  await card.save()
    .then(() => {
      res
        .status(200).json({ status: 200, path: myFile })
    })
    .catch(() => {
      return res.status(500).json({ status: 500 })
    });
}

async function uploadImage(req, res) { // для загрузки файлов
  if (!req.files) {
    return res.status(500).send({ msg: "file is not found" })
  }

  const myFile = req.files.file;
  const ourPath = path.join(__dirname, `../public/`);

  myFile.mv(`${ourPath}${myFile.name}`,
    async function (err) {
      if (err) {
        return res.status(500).send({ msg: "Error occurred" });
      }

      convertImageToBase64(`${ourPath}${myFile.name}`).then(data => saveTheImage(res, data, myFile.name));
    });

}

async function updateArticle(req, res) {
  await Article.findByIdAndUpdate(req.body._id, { ...req.body })
    .then((data) => {
      if (data) {
        return res.status(200).json({ status: 200 });
      } else {
        throw 'error';
      }
    })
    .catch(() => {
      return res.status(500).json({ status: 500 });
    })
}

export { getDataForCards };
export { getArticle };
export { updateViewOfArticle };
export { createCard };
export { createArticle };
export { getAllCards };
export { getAllArticles };
export { uploadImage };
export { updateArticle };
export { getImage };