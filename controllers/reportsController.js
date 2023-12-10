const path = require("path");

const Expense = require("../models/expenseModel");
const { Op } = require("sequelize");

const rootDir = require("../util/path");
const { log } = require("console");

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

  // Check if there is an existing entry for the user in UrlModel
  const existingEntry = await UrlModel.findOne({
    where: { userId: userid },
  });

  if (existingEntry) {
    // If an entry exists, update the URL
    await existingEntry.update({ url: fileURL });
    console.log("Existing entry updated:", fileURL);
  } else {
    // If no entry exists, create a new one
    await UrlModel.create({
      url: fileURL,
      userId: userid,
    });
    console.log("New entry created:", fileURL);
  }

  res.status(201).json({ fileURL, success: true, messageL: "File Downloaded" });
};
