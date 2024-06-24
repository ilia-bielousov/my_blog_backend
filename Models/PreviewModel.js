import { Schema, model } from "mongoose";

const Preview = new Schema({
  content: [{}]
});

export default model('Preview', Preview);