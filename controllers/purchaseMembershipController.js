const Razorpay = require("razorpay");
const Order = require("../models/ordersModel");
const User = require("../models/userModel");

/**
 * purchasePremium controller
 * -Handles the endpoint /purchase/premiumMembership
 * - Initializes a new instance of Razorpay with the provided key ID and key secret.
 * - Sets the amount for the premium membership purchase.
 * - Creates a Razorpay order(rzp.orders.create()) with the specified amount
 * -It takes an asynchronous function as a callback
 *  - The callback awaits  Generating a new order record in the database with the status set to "PENDING" and
 *  - associates it with the user.
 *  - Responds to the client with the created order details and the Razorpay key ID. after the order created in db
 */
exports.purchasePremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });
    const amount = 1000;
    // Initiates Razorpay order creation. Callback function handles order details.
    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      // Creates a new order record in the database using 'Order.create'.
      const createdOrder = await Order.create({
        orderid: order.id,
        status: "PENDING",
        userId: req.user.id,
      });
      // Responds to the client with created order and Razorpay key ID.
      return res.status(201).json({ order: createdOrder, key_id: rzp.key_id });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

/**
 * updateTransactionStatus controller
 * - Handles the endpoint /purchase/updateTransactionStatus  
 * - Retrieves payment and order information from the request body.
 * - Finds the corresponding order in the database using the provided order ID.
 * - Updates the order status to "SUCCESSFUL" and associates the payment ID.
 * - Updates the user's status to indicate they are now a premium user.
 * - Responds to the client with a 202 status and a success message for a successful transaction.
 */

exports.updateTransactionStatus = async (req, res) => {
  try {
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
