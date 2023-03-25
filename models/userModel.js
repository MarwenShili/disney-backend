const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
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
    enum: ["admin", "dev", "student", "user"],
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
    required: [true, "please enter your adress"],
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
});
//3) validate password
userSchema.methods.validatePassword = async function (
  condidatePassword,
  userPassword
) {
  return await bcrypt.compare(condidatePassword, userPassword);
};

// 1) CRYPTAGE WHENE SAVE OR CREATE USER
userSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    // this.passwordConfirm = undefined;
    return next();
  } catch (err) {
    return next(err);
  }
});
// 3) changed password
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

const User = mongoose.model("User", userSchema);
module.exports = User;
