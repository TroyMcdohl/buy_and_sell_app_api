const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name need to be filled."],
    unique: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
