const path = require("path");

// Import the v4 function from the uuid library and save it in uuidv4
const { v4: uuidv4 } = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");

const rootDir = require("../util/path");

const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");

/*
 Utility function which we use during updatePassword
 Hashes a password using bcrypt with a specified number of salt rounds.
 saltrounds=>cost factor for the hashing algorithm
*/
const saltRounds = 10;
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

/*
  Express route handler: Renders the forgot-password page.
*/
exports.forgotPasswordPage = (req, res, next) => {
  const filePath = path.join(rootDir, "views", "forgotPassword.html");

  //Sending the forgot password page as response
  res.sendFile(filePath);
};

/*
  Express route handler: Renders the reset-password page.
*/
exports.resetPasswordPage = (req, res, next) => {
  const filePath = path.join(rootDir, "views", "resetPassword.html");

  //sending the resetPassword page as response
  res.sendFile(filePath);
};

/*
  Handles a POST request to the "/password/sendMail" endpoint.

  - Extract email from the request body.
  - Generate a unique request ID.
  - Find the user with the provided email in the database.
  - If the user is found, create a reset request in the database.
  - Configure Sendinblue API for sending transactional emails.
  - Send an email to the user with a password reset link.
    (The link includes the unique request ID as a parameter.)
  - Return a 200 status with a success message on successful email send.
  - Return a 404 status for an invalid email.
  - Return a 409 status for a failed password change.
*/
exports.sendMail = async (req, res, next) => {
  try {
    //Extract email from the request body
    const email = req.body.email;

    //Generate a unique requestId using uuid
    const requestId = uuidv4();

    //Find the user by email in the database
    const recepientEmail = await User.findOne({ where: { email: email } });

    //Extract the id from the retreived user data(database)
    const userId = recepientEmail.dataValues.id;

    //Check if the user exists
    if (!recepientEmail) {
      return res
        .status(404)
        .json({ message: "Please provide the registered email!" });
    }

    //Create a new Reset request in the ResetPassword table(userId is foreign key)
    const resetRequest = await ResetPassword.create({
      id: requestId,
      isActive: true,
      userId: userId,
    });

    //Set up Sendinblue API client
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    //Set up TransactionalEmailsApi
    const transEmailApi = new Sib.TransactionalEmailsApi();

    //define sender and receiver information
    const sender = {
      email: "suvadeepworks@gmail.com",
      name: "Suvadeep",
    };
    const receivers = [
      {
        email: email,
      },
    ];

    //Send a transactional email using Sendinblue
    const emailResponse = await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "link Below",
      htmlContent: `<h3>Hi! We got the request from you for reset the password. Here is the link below >>></h3>
      <a href="http://localhost:3000/password/resetPasswordPage/{{params.requestId}}"> Click Here</a>`,
      params: {
        requestId: requestId,
      },
    });

    //Return a  success rsponse
    return res.status(200).json({
      message:
        "Link for reset the password is successfully send on your Mail Id!",
    });
  } catch (err) {
    //return an error response if any issues occur during the response
    return res.status(409).json({ message: "failed changing password" });
  }
};

/*
  
  Handles a POST request to the "/password/resetPassword" endpoint.

  - Extracts the request ID from the referer header.(which we send during sendMail)
  - Extracts the new password from the request body.
  - Checks if the reset request associated with the ID is active.
  - If active, updates the reset request status to inactive.
  - Hashes the new password.
  - Updates the user's password in the database.
  - Returns a 200 status with a success message upon successful password change.
  - Returns a 409 status for a failed password change.
*/
exports.updatePassword = async (req, res, next) => {
  try {
    //Extract the requestId from the referer header
    const requestId = req.headers.referer.split("/");

    const uniqueId = requestId[requestId.length - 1];

    //Extract the new password from the request body
    const password = req.body.password;

    //Check for an active reset request with the given requestId
    const checkResetRequest = await ResetPassword.findAll({
      //querry the database for the id(uuid) and isActive:true
      where: { id: uniqueId, isActive: true },
    });

    //if an active reset request is found
    if (checkResetRequest[0]) {
      //Extract userId from the reset request
      const userId = checkResetRequest[0].dataValues;

      //Deactivate the reset request
      const result = ResetPassword.update(
        { isActive: false },
        { where: { id: requestId } }
      );

      //Hash the new password
      const newPassword = await hashPassword(password);

      //update the users password with the new hashed password
      const user = await User.update(
        { password: newPassword },
        { where: { id: userId.userId } }
      );

      return res.status(200).json({ message: "Succesfully changed password" });
    } else {
      res.status(409).json({ message: "Failed to change password!" });
    }
  } catch (err) {
    console.log(err);
    return res.status(409).json({ message: "Failed to change password!" });
  }
};
