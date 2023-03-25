const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);

//get current user
router
  .route("/me")
  .get(
    authController.protect,
    userController.getMe,
    userController.getUserById
  );

//list user by id && update user && soft delete
router
  .route("/:id")
  .get(authController.protect, userController.getUserById)
  .put(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteCurrentUser);

module.exports = router;
