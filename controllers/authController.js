const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { promisify } = require("util");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");

//get token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// create and send token => to USE
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//signup
exports.signup = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email }).select("+password");
  if (user) {
    return res.status(404).json({
      status: "fail",
      message: "User already exist",
    });
  }
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
//login
exports.login = async (req, res, next) => {
  try {
    //1)check if email and password exist in req.body
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "please provide email and password",
      });
    }
    //2) check if useremail exists && password is correct password exist
    const user = await User.findOne({ email }).select("+password");
    // console.log(!(await user.validatePassword(password, user.password)));
    console.log(user.password, password);

    if (!user || !(user.password === password)) {
      req.user = user;
      return res.status(401).json({
        status: "fail",
        message: "incorrect email or password",
      });
    }
    //3) if evrything ok , send token to the client
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

//protect routes => authorize just the logged in user
exports.protect = async (req, res, next) => {
  // 1)GETTING TOKEN AND CHECK OF IT S THERE
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).send({
      status: "fail",
      message: "you are note logged in ! please log to get access",
    });
  }
  // 2) VERIFICATION TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) IF THE USER STILL EXIST
  const currentUser = await User.findById(decoded.id);
  //decoded.id is the id of the user logged in
  if (!currentUser) {
    return res.status(401).send({
      status: "fail",
      message: "the user belonging to this token does no longer exist",
    });
  }
  // 4)CHECK IF THE USER CHANGED PASSWORD AFTER WAS ISSUED
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return res.status(401).send({
      status: "fail",
      message: "Password Recently changed please login again",
    });
  }
  // Grand access to protected route
  req.user = currentUser;
  next();
};
//AUTHORIZATION // admin ...
//get the current user role from the protect middleware function
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
//forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1)get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send({
      status: "fail",
      message: "There is no user with this email",
    });
  }
  // 2) generate the random reset  token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail();
    sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).send({
      status: "fail",
      message: "There was an error sending the email. Try again later!",
    });
  }
});
//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).send({
      status: "fail",
      message: "Token is invalid or has expired",
    });
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});
//change password by ligged in usere
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  // if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
  if (req.body.passwordCurrent != user.password) {
    return res.status(401).json({
      status: "fail",
      message: "Your current password is wrong.",
    });
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
