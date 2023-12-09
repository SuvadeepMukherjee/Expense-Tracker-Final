const Sequelize = require("sequelize");
const sequelize = require("../util/database");

// Defines a Sequelize model 'ResetPassword' for the 'ResetPassword'
// table with specified attributes and data types.

const ResetPassword = sequelize.define("ResetPassword", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  isActive: Sequelize.BOOLEAN,
});
module.exports = ResetPassword;
