const path = require("path");

const AWS = require("aws-sdk");

const rootDir = require("../util/path");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const UrlModel = require("../models/urlModel");
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

/**
 * getAllExpensesforPagination Controller
 * - Retrieves the page number from the request parameters.
 * - Sets the limit and offset for pagination based on the page number.
 * - Counts the total number of expenses for the authenticated user.
 * - Calculates the total number of pages based on the limit and total expenses.
 * - Queries the database for expenses based on the calculated offset and limit.
 * - Responds with a JSON object containing the fetched expenses and total number of pages.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves after handling the getAllExpensesforPagination operation.
 */
exports.getAllExpensesforPagination = async (req, res, next) => {
  try {
    // Retrieve the page number from the request parameters
    const pageNo = req.params.page;

    // Set the limit and offset for pagination based on the page number
    const limit = 10;
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

/**
 * uploadToS3 Utility Function
 * - Uploads the provided data to an Amazon S3 bucket.
 * - Requires the BUCKET_NAME, IAM_USER_KEY, and IAM_USER_SECRET to be set as environment variables.
 * - Returns a Promise that resolves with the S3 bucket location of the uploaded file.
 * - Logs success or error messages to the console.
 */
function uploadTos3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("something went wrong", err);
        reject(err);
      } else {
        console.log("success", s3response);
        resolve(s3response.Location);
      }
    });
  });
}

/**
 * downloadExpense Controller
 * - Logs the authenticated user information to the console.
 * - Retrieves the user ID from the request and queries the database for the user's expenses.
 * - Stringifies the expenses array and logs it to the console.
 * - Generates a file name based on the user ID and current date.
 * - Uploads the stringified expenses to an S3 bucket and retrieves the file URL.
 * - Creates a new record in the UrlModel with the download URL and user ID.
 * - Responds with a JSON object containing the file URL and success message.
 */
exports.downloadExpense = async (req, res, next) => {
  console.log(req.user);
  const userid = req.user.dataValues.id;

  const expenses = await Expense.findAll({
    where: { userId: userid },
  });

  const stringifiedExpenses = JSON.stringify(expenses);
  console.log("The stringified expenses of the user is ", stringifiedExpenses);

  const fileName = `Expenses${userid}/${new Date()}.txt`;
  const fileURL = await uploadTos3(stringifiedExpenses, fileName);
  await UrlModel.create({
    downloadUrl: fileURL,
    userId: userid,
  });

  res.status(201).json({ fileURL, success: true, messageL: "File Downloaded" });
};
