const Sequelize = require("sequelize");
const sequelize = require("../util/database");

// Defines a Sequelize model 'Downloads' for the 'Downloads' table with
// specified attributes and data types.
//The sequelize instance is  created in database.js  and is used here
//to define the "Expenses" model. It serves as a connection to the database
//and provides methods for interacting with it.

const Downloads = sequelize.define("Downloads", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  downloadUrl: {
    type: Sequelize.STRING(),
    unique: true,
    validate: { isUrl: true },
    notEmpty: true,
    allowNull: false,
  },
});
module.exports = Downloads;
