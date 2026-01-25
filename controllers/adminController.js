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

// controllers/adminController.js

async function createArticle(req, res) {
  try {
    // Фронтенд присылает { cardId, content, isPublished }
    const { cardId, content, isPublished } = req.body;

    console.log("Creating article for Card ID:", cardId); // Для отладки

    if (!cardId) {
      return res.status(400).json({ message: "Не передан ID карточки (cardId)" });
    }

    const newArticle = new Article({
      card: cardId, // Сюда подставляется ID
      content: content || [],
      views: 0
    });

    const savedArticle = await newArticle.save();

    // Если сразу публикуем — обновляем карточку
    if (typeof isPublished !== 'undefined') {
      await Card.findByIdAndUpdate(cardId, { isPublished });
    }

    res.status(200).json({
      status: 200,
      id: savedArticle._id,
      message: "Статья создана"
    });

  } catch (err) {
    console.error("Ошибка create:", err);
    res.status(500).json({ message: "Ошибка при создании статьи" });
  }
};

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
    const { id } = req.params;
    console.log(`[GET EDIT] Запрос данных для: ${id}`);

    // 1. Ищем КАРТОЧКУ (по ID или pseudoName)
    let card = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      card = await Card.findById(id);
    }

    // Если по ID не нашли, ищем по pseudoName
    if (!card) {
      card = await Card.findOne({ pseudoName: id });
    }

    if (!card) {
      console.log(`[GET EDIT] Карточка не найдена!`);
      return res.status(404).json({ message: "Карточка не найдена" });
    }

    console.log(`[GET EDIT] Карточка найдена: ${card.name} (ID: ${card._id})`);

    // 2. Ищем СТАТЬЮ
    const article = await Article.findOne({ card: card._id });

    if (article) {
      console.log(`[GET EDIT] Статья существует (ID: ${article._id})`);
      return res.status(200).json({
        _id: article._id,
        content: article.content,
        name: card.name,
        cardId: card._id, // <--- ВАЖНО
        isPublished: card.isPublished
      });
    } else {
      console.log(`[GET EDIT] Статьи нет. Возвращаем пустышку с cardId: ${card._id}`);
      // Возвращаем пустышку, ОБЯЗАТЕЛЬНО с cardId
      return res.status(200).json({
        _id: null,
        content: [],
        name: card.name,
        cardId: card._id, // <--- ВОТ ЗДЕСЬ БЫЛА ПРОБЛЕМА
        isPublished: card.isPublished
      });
    }

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

async function getPreviewById(req, res) {
  try {
    const preview = await Preview.findById(req.params.id);

    if (preview) {
      return res.status(200).json(preview);
    } else {
      return res.status(404).json({ message: "Preview not found" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
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

// controllers/adminController.js

async function updateArticle(req, res) {
  try {
    // Теперь мы ждем еще и флаг isPublished (true/false)
    const { id, content, isPublished } = req.body;

    // 1. Обновляем контент самой статьи
    const article = await Article.findByIdAndUpdate(id, { content }, { new: true });

    if (!article) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    // 2. Если передан флаг публикации, обновляем связанную КАРТОЧКУ
    if (typeof isPublished !== 'undefined') {
      // У статьи есть поле card (ObjectId), используем его
      await Card.findByIdAndUpdate(article.card, { isPublished: isPublished });
    }

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
export { getPreviewById };
export { getPreview };
export { getAllCards };
export { getAllArticles };
export { uploadImage };
export { updateArticle };
export { getImage };