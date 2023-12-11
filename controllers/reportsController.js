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
  //sending reports.html as the response
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
    //Query the database for the expenses on the specified data and for the authenticated user
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
    // Query the database for expenses within the specified month and for the authenticated user
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
  // Retrieving AWS credentials from environment variables
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  // Creating an S3 bucket instance
  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  // S3 upload parameters
  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  // Returning a Promise for the S3 upload operation
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3response) => {
      if (err) {
        reject(err);
      } else {
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
  const userid = req.user.dataValues.id;

  // Query the database for the user's expenses
  const expenses = await Expense.findAll({
    where: { userId: userid },
  });

  // Stringify expenses array for upload
  const stringifiedExpenses = JSON.stringify(expenses);

  // Generate a file name based on user ID and current date
  const fileName = `Expenses${userid}/${new Date()}.txt`;

  // Upload stringified expenses to an S3 bucket and retrieve the file URL
  const fileURL = await uploadTos3(stringifiedExpenses, fileName);

  // Create a new record in the UrlModel with the download URL and user ID
  await UrlModel.create({
    downloadUrl: fileURL,
    userId: userid,
  });

  // Respond with a JSON object containing the file URL and success message
  res.status(201).json({ fileURL, success: true, messageL: "File Downloaded" });
};
