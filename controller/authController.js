const multer = require("multer");
const fs = require("fs");
const AppError = require("../error/AppError");
const User = require("../model/User");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const sharp = require("sharp");
const Email = require("../mail/Email");
const crypto = require("crypto");

const dataObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(new AppError("Users not found.", 404));
  }

  res.status(200).json({
    status: "success",
    users,
  });
});

exports.register = catchAsync(async (req, res, next) => {
  // req.body.photo = req.file.userfile;
  // req.body.nrc_photo = req.files.nrcfile;
  const newUser = await User.create(req.body);

  if (!newUser) {
    next(new AppError("User cannot be created.", 400));
  }

  res.status(201).json({
    status: "success",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (
    !user ||
    !(await user.comparePassword(req.body.password, user.password))
  ) {
    return next(new AppError("Credentials went wrong.Please try again.", 401));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRECT);

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 24 * 3600 * 1000),
    httpOnly: true,
    sameSite: "none",
    domain: ".vercel.app.com",
  });

  res.status(200).json({
    status: "success",
    user,
    token,
  });
});

exports.updateMe = async (req, res, next) => {
  const currentUser = await User.findById(req.user._id);

  if (!currentUser) {
    return next(new AppError("User not found,please login again.", 400));
  }

  if (req.files.photo) {
    fs.unlink(`public/img/users/${currentUser.photo}`, (err) => {
      console.log(err);
    });
  }

  if (req.files.nrc_photo) {
    currentUser.nrc_photo.map((p) => {
      fs.unlink(`public/img/nrc/${p}`, (err) => {
        console.log(err);
      });
    });
  }

  const updateData = dataObj(
    req.body,
    "name",
    "email",
    "nrc",
    "ph_num",
    "role"
  );

  if (req.files.photo) {
    updateData.photo = req.file.userfile;
  }

  if (req.files.nrc_photo) {
    // fs.unlink('public/img/nrc/');
    updateData.nrc_photo = req.files.nrcfile;
  }

  const updatedUser = await User.findByIdAndUpdate(
    currentUser._id,
    updateData,
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",

    updatedUser,
  });
};

exports.updateUser = async (req, res, next) => {
  const currentUser = await User.findById(req.params.uid);

  if (!currentUser) {
    return next(new AppError("User not found,please login again.", 400));
  }

  const updateData = dataObj(
    req.body,

    "role"
  );

  const updatedUser = await User.findByIdAndUpdate(
    currentUser._id,
    updateData,
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    updatedUser,
  });
};

exports.protect = async (req, res, next) => {
  if (!req.cookies) {
    return next(new AppError("Session Expired,Please login again.", 400));
  }

  const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRECT);

  const currentUser = await User.findById(decoded.id);

  req.user = currentUser;

  next();
};

exports.logout = (req, res) => {
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You are not allowed to do this.", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const resetToken = await user.createResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost:3000/auth/resetpassword/${resetToken}`;

  try {
    await new Email(user, resetURL).changeForgotPassword();

    res.status(200).json({
      status: "success",
      message: "Email send successfully",
      user: user,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There is an error sending email,try again", 500));
  }
});

exports.resetPassword = async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  console.log(token);

  const user = await User.findOne({
    passwordResetToken: token,
  });

  if (!user) {
    return next(new AppError("User not found", 400));
  }

  user.password = req.body.newPassword;
  user.confirm_password = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id);

  if (!currentUser) {
    return next(new AppError("Something went wrong,please login again.", 400));
  }

  if (
    !(await currentUser.comparePassword(
      req.body.oldPassword,
      currentUser.password
    ))
  ) {
    return next(new AppError("Your password is wrong,please try again.", 400));
  }

  currentUser.password = req.body.newPassword;
  currentUser.confirm_password = req.body.confirmPassword;

  await currentUser.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload a image", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.fields([
  {
    name: "photo",
    maxCount: 1,
  },
  {
    name: "nrc_photo",
    maxCount: 2,
  },
]);

exports.uploadResizePhoto = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  if (req.files.photo) {
    const takeFile = Object.values(req.files.photo).map((f) => f);
    req.file = takeFile[0];
    req.file.userfile = `user-${v4()}-${
      req.file.originalname.split(".")[0]
    }.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.userfile}`);
  }

  if (req.files.nrc_photo) {
    req.files.nrcfile = [];
    Object.values(req.files.nrc_photo).map(async (f, i) => {
      req.files.nrcfile.push(
        `nrc-${v4()}-${f.originalname.split(".")[0]}.jpeg`
      );

      await sharp(f.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/nrc/${req.files.nrcfile[i]}`);
    });
  }

  next();
};

exports.nonUserRemoveImg = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    user.photo = undefined;
    user.nrc_photo = undefined;
  }

  next();
});
