const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gameSchema = {
  id: { type: Number },
  title: { type: String },
  thumbnail: { type: String },
  short_description: { type: String },
  genre: { type: String },
  platform: { type: String },
  publisher: { type: String },
  developer: { type: String },
  release_date: { type: String },
  rating: { type: Number },
  price: { type: Number },
  video: { type: String },
};

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
