const multer = require("multer");
const AppError = require("../error/AppError");
const Product = require("../model/Product");
const catchAsync = require("../utils/catchAsync");
const { v4 } = require("uuid");
const sharp = require("sharp");
const fs = require("fs");

exports.createProduct = catchAsync(async (req, res, next) => {
  req.body.photo = req.file.productFile;
  req.body.user = req.user;
  const newProduct = await Product.create(req.body);

  if (!newProduct) {
    return next(new AppError("Product cannot be created.", 400));
  }

  res.status(201).json({
    status: "success",
    product: newProduct,
  });
});

exports.getProducts = catchAsync(async (req, res, next) => {
  let products = await Product.find().sort("createdAt");

  if (req.query.type) {
    products = await Product.find({ category: req.query.type }).sort(
      "createdAt"
    );
  }

  if (!products) {
    return next(new AppError("Product not found.", 404));
  }

  res.status(200).json({
    status: "success",
    products,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const products = await Product.findById(req.params.pid);

  if (!products) {
    return next(new AppError("Product not found.", 404));
  }

  res.status(200).json({
    status: "success",
    products,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.pid);

  if (req.file) {
    fs.unlink(`public/img/product/${product.photo}`, (err) => {
      console.log(err);
    });

    req.body.photo = req.file.productFile;
  }

  if (req.file == null) {
    req.body.photo = product.photo;
  }

  const updateProduct = await Product.findByIdAndUpdate(
    req.params.pid,
    req.body,
    {
      new: true,
    }
  );

  if (!updateProduct) {
    return next(new AppError("Product cannot be updated.", 400));
  }

  res.status(200).json({
    status: "success",
    updateProduct,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.pid);

  if (!product) {
    return next(new AppError("Product cannot be deleted.", 400));
  }

  res.status(204).json({
    status: "success",
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload an image.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductPhoto = upload.single("photo");

exports.uploadProductResizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.file.productFile = `${v4()}-${req.file.originalname.split(".")[0]}.jpg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/product/${req.file.productFile}`);

  next();
});
