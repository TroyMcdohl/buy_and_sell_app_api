const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username need to be filled."],
  },
  email: {
    type: String,
    required: [true, "Email need to be filled"],
    unique: true,
  },
  role: {
    type: String,
    default: "user",
  },
  nrc: {
    type: String,
  },
  nrc_photo: [
    {
      type: String,
    },
  ],
  photo: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "Password need to be filled"],
  },
  confirm_password: {
    type: String,
    required: [true, "Confirm Password need to be filled"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: "Password need to be same.",
    },
  },
  ph_num: {
    type: Number,
    required: [true, "Phone number need to be filled."],
    unique: true,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
  this.confirm_password = undefined;
});

userSchema.methods.comparePassword = async function (reqPwd, userPwd) {
  return bcrypt.compare(reqPwd, userPwd);
};

userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
