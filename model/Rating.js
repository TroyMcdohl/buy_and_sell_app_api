const mongoose = require("mongoose");
const Product = require("./Product");
const User = require("./User");

const ratingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: Product,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
  },
  content: {
    type: String,
    required: [true, "Content should be added."],
  },
});

ratingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
