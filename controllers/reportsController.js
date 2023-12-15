const path = require("path");
const Expense = require("../models/expenseModel");
//provides a set of standard operators that can be used in queries to perform complex conditions.
const { Op } = require("sequelize");
const AWS = require("aws-sdk");
const rootDir = require("../util/path");
const UrlModel = require("../models/urlModel");
const sequelize = require("../util/database");

/*
  Controller Function: getReportsPage
  Description:
  This function handles requests for the Reports page.
  - Uses the 'res.sendFile' method to send the reports.html file as the response.
*/
exports.getReportsPage = (req, res, next) => {
  const filePath = path.join(rootDir, "views", "reports.html");

  //Sending the reports.html page as response
  res.sendFile(filePath);
};

/*
  Controller Function: dailyReports
  Handles a POST request to the reports/dailyReports Endpoint 
  - We are sending the date from the frontend reports page 
  - Before reaching this controller the request gets send to the auth.js middleware
  - Retrieves the selected date from the request body.
  - Uses Sequelize's 'Expense' model to query the database for expenses on the specified date.
  - Filters expenses based on both date and user ID.
  - we are sending json  back(array of objects) to the client
  - In the client we extract the data 
  Benefits of using Sequelize transactions:
  - Ensures database consistency by grouping multiple database operations into a single transaction.
  Benefits of using `transaction t`:
  - Helps manage the state of the transaction and allows committing or rolling back as needed.
  Benefits of using `t.commit()`:
  - Finalizes the transaction if all operations within it are successful.
  Benefits of using `t.rollback()`:
  - Rolls back the transaction, undoing any changes made within the transaction.
*/
exports.dailyReports = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const date = req.body.date;
    // Start a Sequelize transaction to ensure database consistency

    //Query the database for the expenses on the specified data and for the authenticated user
    const expenses = await Expense.findAll({
      where: { date: date, userId: req.user.id },
      transaction: t, // Pass the transaction to the query
    });
    // Commit the transaction if all operations are successful
    t.commit();
    return res.status(200).json(expenses);
  } catch (error) {
    console.log(error);
    // Rollback the transaction if there's an error
    t.rollback();
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/*
  Controller Function: monthlyReports
  Handles a POST request to the reports/monthlyReports Endpoint

  Description:
  This asynchronous function handles requests for monthly expense reports.
  - Retrieves the selected month from the request body.
  - Uses Sequelize's 'Expense' model to query the database for expenses within the specified month.
  - Filters expenses based on both date (using Sequelize's [Op.like] operator) and user ID.
  - Sends the fetched expenses as the HTTP response.(raw data , javascript object)
  Benefits of using Sequelize transactions:
  - Ensures database consistency by grouping multiple database operations into a single transaction.
  Benefits of using `transaction t`:
  - Helps manage the state of the transaction and allows committing or rolling back as needed.
  Benefits of using `t.commit()`:
  - Finalizes the transaction if all operations within it are successful.
  Benefits of using `t.rollback()`:
  - Rolls back the transaction, undoing any changes made within the transaction.

  Notes:
  - Utilizes Sequelize's [Op.like] operator to filter expenses by the specified month.
*/
exports.monthlyReports = async (req, res, next) => {
  // Start a Sequelize transaction to ensure database consistency
  const t = await sequelize.transaction();
  try {
    const month = req.body.month;
    // Query the database for expenses within the specified month and for the authenticated user
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.like]: `%-${month}-%`,//queries to perform complex conditions
        },
        userId: req.user.id,
      },
      transaction: t, // Pass the transaction to the query
    });
    // Commit the transaction if all operations are successful
    t.commit();
    return res.status(200).json(expenses);
  } catch (error) {
    // Rollback the transaction if there's an error
    t.rollback();
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
    // Rollback the transaction if there's an error
  }
};

/**
 * uploadToS3 Utility Function
 * - Uploads the provided data to an Amazon S3 bucket.
 * - data is the content to be uploaded and filename is the name
 * - s3Bucket instance created using AWS credentials
 * - object params created to specify the parameters for the s3 upload operation
 * - Returns a Promise that resolves with the S3 bucket location(location of downloaded file)
 *  of the uploaded file.
 * - Rejected with an error object if upload operation fails
 * - Returns a promise to handle the asynchronous nature of upload
 */
function uploadTos3(data, filename) {
  // Retrieving AWS credentials from environment variables
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  // Creating an S3 bucket instance(internal working of AWS SDK)
  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  // S3 upload parameters
  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    //uploaded object should be publicly readable
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
 * - Handles a GET request to the reports/download Endpoint
 * - Retrieves the user ID from the request and queries the database for the user's expenses.
 * - Stringifies the expenses array and logs it to the console.
 * - Generates a file name based on the user ID and current date.
 * - Uploads the stringified expenses to an S3 bucket and retrieves the file URL.
 * - Creates a new record in the UrlModel with the download URL and user ID.
 * - Responds with a JSON object containing the file URL and success message.
 */
exports.downloadExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const userid = req.user.dataValues.id;

    // Query the database for the user's expenses
    const expenses = await Expense.findAll({
      where: { userId: userid },
      transaction: t, // Pass the transaction to the query
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
      transaction: t,
    });
    // Commit the transaction if all operations are successful
    await t.commit();

    // Respond with a JSON object containing the file URL and success message
    res
      .status(200)
      .json({ fileURL, success: true, message: "File Downloaded" });
  } catch (error) {
    // Rollback the transaction if there's an error
    await t.rollback();
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
