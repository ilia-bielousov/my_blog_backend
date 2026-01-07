import Article from '../Models/ArticleModel.js';
import Card from '../Models/CardModel.js';
import Image from '../Models/ImageModel.js';
import Preview from '../Models/PreviewModel.js';

import mongoose from 'mongoose';

import { uploadImageToGCS } from '../utils/gcsUpload.js';

const handleError = (res, error) => {
  res.status(500).json({ error });
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

async function updateCard(req, res) {
  try {
    // Получаем данные, которые прислал фронтенд
    const { id, name, description, choose, image, pseudoName } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Не указан ID карточки" });
    }

    // Ищем карточку по ID и обновляем поля
    // { new: true } - чтобы вернуть уже обновленный объект (опционально)
    const updatedCard = await Card.findByIdAndUpdate(id, {
      name,
      description,
      choose,
      image,
      pseudoName
    }, { new: true });

    if (!updatedCard) {
      return res.status(404).json({ message: "Карточка не найдена" });
    }

    // Возвращаем успех
    res.status(200).json({
      status: 200,
      message: "Карточка успешно обновлена",
      card: updatedCard
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при обновлении карточки" });
  }
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

async function getArticleByCardId(req, res) {
  try {
    const { cardId } = req.params;
    // Ищем статью, где поле card равно переданному ID
    const article = await Article.findOne({ card: cardId });

    console.log(cardId);
    console.log(article);


    if (!article) {
      return res.status(404).json({ message: "Статья еще не создана" });
    }

    res.status(200).json(article);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}

async function getArticleForEdit(req, res) {
  try {
    const { id } = req.params; // Это может быть _id статьи ИЛИ pseudoName из URL

    // Попробуем найти статью. 
    // Нам нужно "подтянуть" данные из карточки (populate), чтобы получить имя.

    // Сначала ищем по _id (если в URL передан ID статьи)
    let article = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      article = await Article.findById(id).populate('card');
    }

    // Если не нашли по ID, значит это pseudoName. 
    // Нужно сначала найти карточку, а потом статью этой карточки.
    if (!article) {
      const card = await Card.findOne({ pseudoName: id });
      if (card) {
        article = await Article.findOne({ card: card._id }).populate('card');
      }
    }

    if (!article) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    // Формируем ответ, который ждет фронтенд
    res.status(200).json({
      _id: article._id,
      content: article.content,
      // ВАЖНО: берем имя из связанной карточки
      name: article.card ? article.card.name : "Без названия",
      cardId: article.card ? article.card._id : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

async function createPreview(req, res) {
  const preview = new Preview({
    content: [...req.body]
  });

  preview
    .save()
    .then((result) => {
      res
        .status(200).json({ id: result._id });
    })
    .catch(() => {
      return res.status(500).json({ status: 500 });
    })
}

async function deletePreview(req, res) {
  try {
    await Preview.findByIdAndDelete(req.params.id);
    return res.status(200).send({ status: 200, msg: "ok" });

  } catch (err) {
    return res.status(500).send({ status: 500, msg: 'not ok' });
  }
}

async function patchPreview(req, res) {
  await Preview.findByIdAndUpdate(req.body._id, { content: req.body.content }) // тут
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

async function getPreview(req, res) {
  Preview
    .find()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => handleError(res, err));
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

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    const imageUrl = await uploadImageToGCS(req.file);

    res.status(200).json({
      path: imageUrl,
      name: req.file.originalname
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

async function updateArticle(req, res) {
  try {
    const { id, content } = req.body; // Получаем ID статьи и новый контент

    // Обновляем только контент
    await Article.findByIdAndUpdate(id, { content });

    res.status(200).json({ status: 200, message: "Обновлено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка обновления" });
  }
};

export { updateViewOfArticle };
export { createCard };
export { updateCard };
export { createArticle };
export { getArticleByCardId };
export { getArticleForEdit };
export { createPreview };
export { patchPreview };
export { deletePreview };
export { getPreview };
export { getAllCards };
export { getAllArticles };
export { uploadImage };
export { updateArticle };
export { getImage };