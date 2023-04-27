const Order = require("../models/commandeModel");

const factory = require("./factory");

// find all users
exports.getAllOrders = factory.findAll(Order);
//get current order using the getUserByID
exports.getMyCommandes = async (req, res, next) => {
  //get all commandes
  const orders = await Order.find();
  //filter commandes by email
  const myorders = orders.filter((el) => el.user.email === req.user.email);
  //return my orders
  return res.status(400).json({
    status: "sucess",
    myorders,
  });
};

exports.getOrderById = factory.findOne(Order);
// update order
exports.updateOrder = factory.updateOne(Order);

exports.createCommande = factory.createOne(Order);
