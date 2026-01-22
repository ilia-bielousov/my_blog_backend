import Article from '../Models/ArticleModel.js';
import Card from '../Models/CardModel.js';

async function getHome(req, res) {
  try {
    await Card
      .find({ home: "home" })
      .then((data) => {
        res.status(200)
          .json({ data, status: 200 });
      })
  } catch (err) {
    return res.status(500).json({ status: 500 });
  }
}

async function getDataForCards(req, res) {
  try {
    // Ищем только опубликованные
    const cards = await Card.find({ isPublished: true });

    // Гарантируем, что вернем массив, даже если cards почему-то null
    res.status(200).json({ data: cards, status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading cards" });
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

export { getHome };
export { getArticle };
export { getDataForCards };