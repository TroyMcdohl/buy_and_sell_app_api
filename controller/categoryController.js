const AppError = require("../error/AppError");
const Category = require("../model/Category");
const catchAsync = require("../utils/catchAsync");

exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);

  if (!newCategory) {
    return next(new AppError("Category cannot be created.", 400));
  }

  res.status(201).json({
    status: "success",
    category: newCategory,
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  if (!categories) {
    return next(new AppError("Category not found.", 404));
  }

  res.status(200).json({
    status: "success",
    categories,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.cid);

  if (!category) {
    return next(new AppError("Category not found.", 404));
  }

  res.status(204).json({
    status: "success",
  });
});
