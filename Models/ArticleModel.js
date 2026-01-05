import { Schema, model } from "mongoose";

const Article = new Schema({
  card: {
    type: Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  content: [{}],
  views: {
    type: Number,
    default: 0
  },
})

export default model('Article', Article);