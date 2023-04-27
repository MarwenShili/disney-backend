const express = require("express");
const commandeController = require("../controllers/commandeController");
const authController = require("../controllers/authController");

const router = express.Router();
router.post("/", commandeController.createCommande);
router.get("/", commandeController.getAllOrders);
router.get(
  "/myorders",
  authController.protect,
  commandeController.getMyCommandes
);

module.exports = router;
