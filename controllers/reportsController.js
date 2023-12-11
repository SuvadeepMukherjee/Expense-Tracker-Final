const path = require("path");

const Expense = require("../models/expenseModel");
const { Op } = require("sequelize");
const AWS = require("aws-sdk");
const rootDir = require("../util/path");
const UrlModel = require("../models/urlModel");

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
  - The 'raw: true' option in Sequelize's findAll() method instructs the query to return raw database records as plain JavaScript objects instead of Sequelize model instances. 
  Notes:
  - Utilizes Sequelize's [Op.like] operator to filter expenses by the specified month.
*/
exports.monthlyReports = async (req, res, next) => {
  try {
    const month = req.body.month;
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.like]: `%-${month}-%`,
        },
        userId: req.user.id,
      },
      raw: true,
    });
    return res.send(expenses);
  } catch (error) {
    console.log(error);
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
