const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.route("/").get(authController.getUsers);

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);

router.route("/logout").patch(authController.logout);

router
  .route("/updateme")
  .patch(
    authController.protect,
    authController.uploadUserPhoto,
    authController.uploadResizePhoto,
    authController.updateMe
  );

router
  .route("/updatepassword")
  .patch(authController.protect, authController.updatePassword);

router.route("/forgotpassword").post(authController.forgotPassword);

router.route("/resetpassword/:resetToken").patch(authController.resetPassword);
router
  .route("/updateuser/:uid")
  .patch(authController.protect, authController.updateUser);

module.exports = router;
