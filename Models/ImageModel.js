import { Schema, model } from "mongoose";

const Image = new Schema({
  imageSource: {
    type: String,
  },
  imageUrl: {
    type: String
  }
});

export default model('Image', Image);