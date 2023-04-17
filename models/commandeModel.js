const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: Object,
  },
  products: {
    type: [],
  },
  total_with_tax: {
    type: Object,
  },

  shipping: {
    type: Object,
  },
  cart_id: {
    type: String,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
