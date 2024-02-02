const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const authController = require("../controller/authController");

router
  .route("/")
  .post(authController.protect, categoryController.createCategory);
router.route("/").get(categoryController.getCategories);
router.route("/:cid").delete(categoryController.deleteCategory);

module.exports = router;
