const path = require("path");

const Expense = require("../models/expenseModel");
const { Op } = require("sequelize");

const rootDir = require("../util/path");

/*
  Controller Function: getReportsPage
  Description:
  This function handles requests for the Reports page.
  - Uses the 'res.sendFile' method to send the reports.html file as the response.
*/
exports.getReportsPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "reports.html"));
};

/*
  Controller Function: dailyReports

  Description:
  This asynchronous function handles requests for daily expense reports.
  - Retrieves the selected date from the request body.
  - Uses Sequelize's 'Expense' model to query the database for expenses on the specified date.
  - Filters expenses based on both date and user ID.
  - Sends the fetched expenses as the HTTP response.

*/
exports.dailyReports = async (req, res, next) => {
  try {
    const date = req.body.date;
    const expenses = await Expense.findAll({
      where: { date: date, userId: req.user.id },
    });
    return res.send(expenses);
  } catch (error) {
    console.log(error);
  }
};

/*
  Controller Function: monthlyReports

  Description:
  This asynchronous function handles requests for monthly expense reports.
  - Retrieves the selected month from the request body.
  - Uses Sequelize's 'Expense' model to query the database for expenses within the specified month.
  - Filters expenses based on both date (using Sequelize's [Op.like] operator) and user ID.
  - Sends the fetched expenses as the HTTP response.

  Notes:
  - Utilizes Sequelize's [Op.like] operator to filter expenses by the specified month.
*/
exports.monthlyReports = async (req, res, next) => {
  try {
    // Retrieve the selected month from the request body
    const month = req.body.month;

    // Use Sequelize's 'Expense' model to query the database for expenses within the specified month
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.like]: `%-${month}-%`,
        },
        userId: req.user.id,
      },
      raw: true,
    });

    // Send the fetched expenses as the HTTP response
    return res.send(expenses);
  } catch (error) {
    // Log errors to the console
    console.log(error);
  }
};
