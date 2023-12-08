const Razorpay = require("razorpay");
const Order = require("../models/ordersModel");
const User = require("../models/userModel");
const userController = require("./userController");

exports.purchasePremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });

    const amount = 100000;
    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      const createdOrder = await Order.create({
        orderid: order.id,
        status: "PENDING",
        userId: req.user.id,
      });

      return res.status(201).json({ order: createdOrder, key_id: rzp.key_id });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    console.log("inside upadate transaction status");
    console.log("body of req.body", req.body);
    //const { payment_id, order_id } = req.body;
    //console.log("body of req.user.dataValues.id", req.user.dataValues.id);

    const payment_id = req.body.payment_id;
    const order_id = req.body.order_id;

    const order = await Order.findOne({ where: { orderid: order_id } });

    // Update the specific order record
    const updateData = {
      paymentid: payment_id,
      status: "SUCCESSFUL",
    };
    await Order.update(updateData, {
      where: {
        orderid: order_id, // Specify the condition for the update
      },
    });

    const updateUser = {
      isPremiumUser: true,
    };
    await User.update(updateUser, {
      where: {
        id: req.user.dataValues.id, // Specify the condition for the update
      },
    });

    return res
      .status(202)
      .json({ success: true, message: "Transaction Successful" });
  } catch (err) {
    console.error(err);
  }
};
