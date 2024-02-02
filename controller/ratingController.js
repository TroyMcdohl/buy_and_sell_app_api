const Rating = require("../model/Rating");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../error/AppError");

exports.createRating = catchAsync(async (req, res, next) => {
  req.body.user = req.user;
  req.body.product = req.params.pid;
  const newRating = await Rating.create(req.body);

  if (!newRating) {
    return next(new AppError("Rating cannot be created.", 400));
  }

  res.status(201).json({
    status: "success",
    rating: newRating,
  });
});

exports.getRatings = catchAsync(async (req, res, next) => {
  const ratings = await Rating.find();

  if (!ratings) {
    return next(new AppError("Rating cannot be found.", 400));
  }

  res.status(201).json({
    status: "success",
    ratings,
  });
});

exports.deleteRating = catchAsync(async (req, res, next) => {
  const rating = await Rating.findByIdAndDelete(req.params.rid);

  if (!rating) {
    return next(new AppError("Rating cannot be deleted.", 400));
  }

  res.status(204).json({
    status: "success",
  });
});
