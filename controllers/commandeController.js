const Order = require("../models/commandeModel");
const factory = require("./factory");

// find all users
exports.getAllOrders = factory.findAll(Order);
//get current order using the getUserByID
exports.getMyCommandes = (req, res, next) => {
  req.params.id = req.user.id;
  console.log(req.user.id);
};

exports.getOrderById = factory.findOne(Order);
// update order
exports.updateOrder = factory.updateOne(Order);

exports.createCommande = factory.createOne(Order);
