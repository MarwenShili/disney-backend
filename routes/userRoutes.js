const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);
//get current user
router
  .route("/me")
  .get(
    authController.protect,
    userController.getMe,
    userController.getUserById
  );

//get current user
router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );

//list user by id && update user && soft delete
router
  .route("/:id")
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(authController.protect, userController.deleteCurrentUser);

module.exports = router;
