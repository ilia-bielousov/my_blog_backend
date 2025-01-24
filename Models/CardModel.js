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
  // order: {
  //   type: Number
  // }
});

export default model('Card', Card);