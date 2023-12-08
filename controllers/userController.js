const path = require("path");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rootDir = require("../util/path");
const User = require("../models/userModel");

/*
  This function generates an access token using the provided user ID and email.
  - Utilizes the 'jsonwebtoken' library to sign a token containing the user's ID and email.
  - Returns the generated access token.
*/
function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.TOKEN);
}

exports.getSignUpPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "sign-up.html"));
};

exports.getLoginPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
};

/*
  This function handles user sign-up requests.
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

    await User.findOne({ where: { email: email } })
      .then((user) => {
        if (user) {
          res.status(409).json({
            error: "This email is already taken .Please choose another one",
          });
        } else {
          bcrypt.hash(password, 10, async (err, hash) => {
            await User.create({
              name: name,
              email: email,
              password: hash,
            });
          });
          res.status(200).json({
            success: true,
            message: "Login Successful!",
          });
        }
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
};

/*
  This function handles user login requests.
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
    console.log(req.body);
    const email = req.body.emailValue;
    const password = req.body.passwordValue;

    await User.findOne({ where: { email: email } }).then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Something went Wrong!" });
          }
          if (result == true) {
            return res.status(200).json({
              success: true,
              message: "Login Successful!",
              token: generateAccessToken(user.id, user.email),
            });
          } else {
            return res.status(401).json({
              success: false,
              message: "Password Incorrect!",
            });
          }
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "User doesn't Exists!",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
