const Sequelize = require("sequelize");
const sequelize = require("../util/database");

// Defines a Sequelize model 'ResetPassword' for the 'ResetPassword'
// table with specified attributes and data types.
//The sequelize instance is  created in database.js  and is used here
//to define the "Expenses" model. It serves as a connection to the database
//and provides methods for interacting with it.

const ResetPassword = sequelize.define("ResetPassword", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  isActive: Sequelize.BOOLEAN,
});
module.exports = ResetPassword;
