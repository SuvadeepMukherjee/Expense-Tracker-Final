const Razorpay = require("razorpay");
const Order = require("../models/ordersModel");
const User = require("../models/userModel");
const userController = require("./userController");

/**
 * purchasePremium controller
 * - Initializes a new instance of Razorpay with the provided key ID and key secret.
 * - Sets the amount for the premium membership purchase.
 * - Creates a Razorpay order with the specified amount and currency (INR).
 * - Generates a new order record in the database with the status set to "PENDING" and associates it with the requesting user.
 * - Responds to the client with the created order details and the Razorpay key ID.
 */
exports.purchasePremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });
    const amount = 1000;
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

/**
 * updateTransactionStatus controller
 * - Retrieves payment and order information from the request body.
 * - Finds the corresponding order in the database using the provided order ID.
 * - Updates the order status to "SUCCESSFUL" and associates the payment ID.
 * - Updates the user's status to indicate they are now a premium user.
 * - Responds to the client with a 202 status and a success message for a successful transaction.
 */

exports.updateTransactionStatus = async (req, res) => {
  try {
    console.log("inside upadate transaction status");
    console.log("body of req.body", req.body);
    const payment_id = req.body.payment_id;
    const order_id = req.body.order_id;
    const order = await Order.findOne({ where: { orderid: order_id } });
    const updateData = {
      paymentid: payment_id,
      status: "SUCCESSFUL",
    };
    await Order.update(updateData, {
      where: {
        orderid: order_id,
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
