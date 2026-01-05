import { Schema, model } from "mongoose";

const Card = new Schema({
  choose: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  pseudoName: {
    type: String
  },
  home: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: false // <--- По умолчанию это черновик!
  },
});

export default model('Card', Card);