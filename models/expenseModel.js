const Sequelize = require("sequelize");
const sequelize = require("../util/database");

// Defines a Sequelize model 'Expenses' for the 'expenses' table with
// specified attributes and data types.

const Expenses = sequelize.define("expenses", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  date: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
});

module.exports = Expenses;
