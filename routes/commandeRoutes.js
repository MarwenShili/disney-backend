const express = require("express");
const commandeController = require("../controllers/commandeController");

const router = express.Router();
router.post("/", commandeController.createCommande);
router.get("/", commandeController.getAllOrders);

module.exports = router;
