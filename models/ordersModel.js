const Sequelize = require("sequelize");
const sequelize = require("../util/database");

// Defines a Sequelize model 'Order' for the 'order' table with
// specified attributes and data types.
//The sequelize instance is  created in database.js  and is used here
//to define the "Expenses" model. It serves as a connection to the database
//and provides methods for interacting with it.
const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  paymentid: Sequelize.STRING,
  orderid: Sequelize.STRING,
  status: Sequelize.STRING,
});
module.exports = Order;
