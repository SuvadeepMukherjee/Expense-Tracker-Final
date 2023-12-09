const path = require("path");

const Expense = require("../models/expenseModel");
const { Op } = require("sequelize");

const rootDir = require("../util/path");

exports.getReportsPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "reports.html"));
};
