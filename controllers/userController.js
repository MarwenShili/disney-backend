const User = require("../models/userModel");
const factory = require("./factory");

// find all users
exports.getAllUsers = factory.findAll(User);
//get current user using the getUserByID
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUserById = factory.findOne(User);
// update user
exports.updateUser = factory.updateOne(User);
// delete user
exports.deleteCurrentUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      status: "sucess deleted",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};
