const path = require("path");

//directory name of the main modules filename(app.js)
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
 * - Handles a POST request on /expense/addExpense
 * - From the client we are sending date,category,description,amount
 * - This middleware passes through the auth.js middleware
 * - Initiates a database transaction using Sequelize.
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
 * - Handles the GET request on the endpoint expense/getAllExpenses
 * - We are calling this controller during editing expenses(getting all expenses)
 * - This controller goes through the auth.js middleware before reaching here
 * - Retrieves all expenses associated with the authenticated user.
 * - Uses Sequelize to query the database and fetch expenses based on the user ID.
 * - Convert the raw data to json and send it back to the client
 * - Responds with a JSON array containing the retrieved expenses.
 */
exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    //send the responses as json
    res.json(expenses);
  } catch (err) {
    console.log(err);
  }
};

/**
 * deleteExpense controller
 * - Handles The GET request for the endpoint expense/deleteExpense/${id}
 * - Including :id in the route path allows these routes to capture the  ID from the URL.
 * - This ID is then used to identify the specific expense to be deleted
 * - Extracts expense ID from the request parameters.
 * - Before reaching this middleware it reaches the auth.js middleware
 * - Retrieves the existing expense using the ID.
 * - Updates the totalExpenses of the authenticated user
 * - Deletes the expense record from the database.
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
 * - Handles the endpoint expense/editExpense/${id}
 * - Including :id in the route path allows these routes to capture the expense ID from the URL.
 * - This ID is then used to identify the specific expense to be deleted or edited.
 * - This middleware is only reached after passing thorough the auth middleware
 * - from the client we are sending category,description,amount
 * - Extracts expense ID, category, description, and amount from the request parameters and body.
 * - Retrieves the existing expense using the ID.
 * - Updates the totalExpenses of the authenticated user by adjusting for the changes in the expense amount.
 * - Updates the expense details in the database.
 *
 */
exports.editExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = req.body.category;
    const description = req.body.description;
    const amount = req.body.amount;
    //retreives the expense from the table by id
    const expense = await Expense.findByPk(id);
    //updates totalExpenses in user table
    await User.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount + Number(amount),
      },
      { where: { id: req.user.id } }
    );
    //updates the expense in the expense table
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

/**
 * getAllExpensesforPagination Controller
 * - Handles the GET request on the endpoint expense/getAllExpenses/${pageNo}
 * - This end point first goes to the auth.js middleware
 * - an offset is a parameter used to specify the starting point from which a set of data should be retrieved
 * - Retrieves the page number from the request parameters.
 * - Sets the limit and offset for pagination based on the page number.
 * - Counts the total number of expenses for the authenticated user.
 * - Calculates the total number of pages based on the limit and total expenses.
 * - Queries the database for expenses based on the calculated offset and limit.
 * - Responds with a JSON object containing the fetched expenses and total number of pages.
 */
exports.getAllExpensesforPagination = async (req, res, next) => {
  try {
    // Retrieve the page number from the request parameters
    const pageNo = req.params.page;

    // Set the limit and offset for pagination based on the page number
    //an offset is a parameter used to specify the starting point from which a set of data should be retrieved
    const limit = 3;
    const offset = (pageNo - 1) * limit;

    // Count the total number of expenses for the authenticated user
    const totalExpenses = await Expense.count({
      where: { userId: req.user.id },
    });

    // Calculate the total number of pages based on the limit and total expenses
    const totalPages = Math.ceil(totalExpenses / limit);

    // Query the database for expenses based on the calculated offset and limit
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      offset: offset,
      limit: limit,
    });

    // Respond with a JSON object containing the fetched expenses and total number of pages
    res.json({ expenses: expenses, totalPages: totalPages });
  } catch (err) {
    console.log(err);
  }
};
