const express = require("express");
const router = express.Router({ mergeParams: true });
const ratingController = require("../controller/ratingController");
const authController = require("../controller/authController");

router.route("/").post(authController.protect, ratingController.createRating);
router.route("/").get(ratingController.getRatings);
router.route("/:rid").delete(ratingController.deleteRating);

module.exports = router;
