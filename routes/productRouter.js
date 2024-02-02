const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const productController = require("../controller/productController");
const ratingRouter = require("./ratingRouter");

router.use("/:pid/rating", ratingRouter);

router.route("/").get(productController.getProducts);
router.route("/:pid").get(productController.getProduct);

router.use(authController.protect);

router
  .route("/")
  .post(
    productController.uploadProductPhoto,
    productController.uploadProductResizePhoto,
    productController.createProduct
  );

router
  .route("/:pid")
  .patch(
    productController.uploadProductPhoto,
    productController.uploadProductResizePhoto,
    productController.updateProduct
  );

router.route("/:pid").delete(productController.deleteProduct);

module.exports = router;
