const Sequelize = require("sequelize");
const sequelize = require("../util/database");

// Defines a Sequelize model 'User' for the 'users' table with
// specified attributes and data types.
//The sequelize instance is  created in database.js  and is used here
//to define the "Expenses" model. It serves as a connection to the database
//and provides methods for interacting with it.

const User = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  isPremiumUser: Sequelize.BOOLEAN,
  totalExpenses: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = User;
