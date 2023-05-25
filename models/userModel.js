const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "pleas tell us your name "],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    // unique: true,
    required: [true, "please enter your adress"],
    validate: [validator.isEmail, "Please fill a valid email address"],
  },
  role: {
    type: String,
    default: "user",
    enum: ["admin", "user"],
  },
  phone: {
    type: Number,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: [true, "please enter your pwd"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password "],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// 1) CRYPTAGE WHENE SAVE OR CREATE USER
// userSchema.pre("save", async function save(next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
//     this.password = await bcrypt.hash(this.password, salt);
//     this.passwordConfirm = undefined;
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

// 2) update the passwordChangedAt whene we have chaging of password
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//3) validate password
userSchema.methods.validatePassword = async function (
  condidatePassword,
  userPassword
) {
  return await bcrypt.compare(condidatePassword, userPassword);
};

// 4) changed password
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// 5) CREATE PASSWORD WHEN FORGOT
userSchema.methods.createPasswordResetToken = function () {
  //this token was sended to the user
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // ms

  return resetToken;
};

// 6)  update password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
