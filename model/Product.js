const mongoose = require("mongoose");
const Category = require("./Category");
const User = require("./User");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product need to be filled."],
  },
  photo: {
    type: String,
    required: [true, "Photo need to be filled."],
  },
  price: {
    type: Number,
    required: [true, "Price need to be filled."],
  },
  description: {
    type: String,
    required: [true, "Description need to be filled."],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: Category,
    required: [true, "Category need to be filled."],
  },
  view_count: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name",
  }).populate({
    path: "user",
    select: "photo name ph_num",
  });
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
