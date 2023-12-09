const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rootDir = require("../util/path");
const User = require("../models/userModel");
const sequelize = require("../util/database");

/*
  This function generates an access token using the provided user ID and email.
  - Utilizes the 'jsonwebtoken' library to sign a token containing the user's ID and email.
  - Returns the generated access token.
*/
function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.TOKEN);
}

exports.isPremiumUser = async (req, res, next) => {
  try {
    if (req.user.isPremiumUser) {
      return res.json({ isPremiumUser: true });
    }
  } catch (error) {
    console.log(error);
  }
};

/*
  Express route handler: Renders the sign-up page.
*/
exports.getSignUpPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "sign-up.html"));
};

/*
  Express route handler: Renders the login page.
*/
exports.getLoginPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
};

/*
  Express route handler: Handles user sign-up requests.
  - Extracts user information (name, email, and password) from the request body.
  - Checks if the provided email already exists in the database.
    - If the email exists, returns a 409 status with an error message.
    - If the email is not found, hashes the provided password using bcrypt.
      - Creates a new user in the database with the hashed password.
  - Responds with a status:
    - 200 for successful sign-up, indicating a successful login.
    - 409 for conflicts, such as an email that is already taken.
*/
exports.postUserSignUp = async (req, res, next) => {
  try {
    const name = req.body.nameValue;
    const email = req.body.emailValue;
    const password = req.body.passwordValue;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      // Email already taken
      return res.status(409).json({
        error: "This email is already taken. Please choose another one.",
      });
    }

    // Hash the password and create a new user
    bcrypt.hash(password, 10, async (err, hash) => {
      await User.create({
        name: name,
        email: email,
        password: hash,
      });
    });

    // Respond with success status
    res.status(200).json({
      success: true,
      message: "Login Successful!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/*
  Express route handler: Handles user login requests.
  - Extracts user email and password from the request body.
  - Finds the user in the database based on the provided email.
  - Compares the provided password with the hashed password stored in the database.
    - If the user is found and the passwords match, generates an access token and responds with a success status.
    - If the user is found but the passwords don't match, responds with an authentication failure status.
    - If the user is not found, responds with a user-not-found status.
    - Handles potential errors and responds with appropriate error messages.
*/
exports.postUserLogin = async (req, res, next) => {
  try {
    const email = req.body.emailValue;
    const password = req.body.passwordValue;

    // Find the user in the database
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      // User not found
      return res.status(404).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    // Compare passwords
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        // Internal server error
        return res.status(500).json({
          success: false,
          message: "Something went wrong!",
        });
      }

      if (result) {
        // Passwords match, generate access token
        return res.status(200).json({
          success: true,
          message: "Login Successful!",
          token: generateAccessToken(user.id, user.email),
        });
      } else {
        // Incorrect password
        return res.status(401).json({
          success: false,
          message: "Password Incorrect!",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    User.findAll({
      attributes: [
        [sequelize.col("name"), "name"],
        [sequelize.col("totalExpenses"), "totalExpenses"],
      ],
      order: [[sequelize.col("totalExpenses"), "DESC"]],
    }).then((users) => {
      const result = users.map((user) => ({
        name: user.getDataValue("name"),
        totalExpenses: user.getDataValue("totalExpenses"),
      }));
      res.send(JSON.stringify(result));
    });
  } catch (error) {
    console.log(error);
  }
};
