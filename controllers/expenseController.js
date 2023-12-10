const path = require("path");

const rootDir = require("../util/path");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const sequelize = require("../util/database");

/*
  Express route handler: Renders the expense-home page.
*/
exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "homePage.html"));
};

/**
 * addExpense controller
 * - Initiates a database transaction using Sequelize.
 * - Extracts date, category, description, and amount from the request body.
 * - Updates the totalExpenses of the authenticated user in the database.
 * - Creates a new Expense record in the database with the provided details.
 * - Commits the transaction and responds with a 200 status, redirecting to the "/homePage".
 * - Rolls back the transaction and logs any errors that occur during the process.
 */
exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const date = req.body.date;
    const category = req.body.category;
    const description = req.body.description;
    const amount = req.body.amount;

    await User.update(
      {
        totalExpenses: req.user.totalExpenses + Number(amount),
      },
      { where: { id: req.user.id } },
      { transaction: t }
    );

    await Expense.create(
      {
        date: date,
        category: category,
        description: description,
        amount: amount,
        userId: req.user.id,
      },
      { transaction: t }
    )
      .then((result) => {
        res.status(200);
        res.redirect("/homePage");
      })
      .catch((err) => {
        console.log(err);
      });
    await t.commit();
  } catch {
    async (err) => {
      await t.rollback();
      console.log(err);
    };
  }
};

/**
 * getAllExpenses controller
 * - Retrieves all expenses associated with the authenticated user.
 * - Uses Sequelize to query the database and fetch expenses based on the user ID.
 * - Responds with a JSON array containing the retrieved expenses.
 */
exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.json(expenses);
  } catch (err) {
    console.log(err);
  }
};

/**
 * deleteExpense controller
 * - Extracts expense ID from the request parameters.
 * - Retrieves the existing expense using the ID.
 * - Updates the totalExpenses of the authenticated user by subtracting the expense amount.
 * - Deletes the expense record from the database.
 * - Redirects to the "/homePage" after successful deletion.
 */
exports.deleteExpense = async (req, res, next) => {
  const id = req.params.id;
  try {
    const expense = await Expense.findByPk(id);
    await User.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount,
      },
      { where: { id: req.user.id } }
    );
    await Expense.destroy({ where: { id: id, userId: req.user.id } });
    res.redirect("/homePage");
  } catch (err) {
    console.log(err);
  }
};

/**
 * editExpense controller
 * - Extracts expense ID, category, description, and amount from the request parameters and body.
 * - Retrieves the existing expense using the ID.
 * - Updates the totalExpenses of the authenticated user by adjusting for the changes in the expense amount.
 * - Updates the expense details in the database.
 * - Redirects to the "/homePage" after successful update.
 */
exports.editExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = req.body.category;
    const description = req.body.description;
    const amount = req.body.amount;

    const expense = await Expense.findByPk(id);

    await User.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount + Number(amount),
      },
      { where: { id: req.user.id } }
    );

    await Expense.update(
      {
        category: category,
        description: description,
        amount: amount,
      },
      { where: { id: id, userId: req.user.id } }
    );

    res.redirect("/homePage");
  } catch (err) {
    console.log(err);
  }
};

exports.getAllExpensesforPagination = async (req, res, next) => {
  try {
    const pageNo = req.params.page;
    const limit = 10;
    const offset = (pageNo - 1) * limit;
    const totalExpenses = await Expense.count({
      where: { userId: req.user.id },
    });
    const totalPages = Math.ceil(totalExpenses / limit);
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      offset: offset,
      limit: limit,
    });
    res.json({ expenses: expenses, totalPages: totalPages });
  } catch (err) {
    console.log(err);
  }
};
