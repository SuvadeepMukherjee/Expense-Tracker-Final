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
  -The `jwt.sign()` function takes two main parameters:
     - Payload:  object with the data you want to encode in the token
     - Secret: A secret key used to sign the token. 
  -The resulting JWT is a string
  - we send this as a token during succesfull login (login function backend)
*/
function generateAccessToken(id, email) {
  //first paramater payload(as an object), second paramater secret key
  return jwt.sign({ userId: id, email: email }, process.env.JWT_SECRET);
}

/**
 * - Handles GET request on user/isPremium Endpoint
 * - sent from homePage.js
 * - Before reaching this middleware the middleware goes through the auth.js (authenticated user)
 * - Responds to the client with a JSON object indicating the premium membership status.
 */
exports.isPremiumUser = async (req, res, next) => {
  try {
    if (req.user.isPremiumUser) {
      return res.status(200).json({ isPremiumUser: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/*
  Express route handler: Renders the sign-up page.
*/
exports.getSignUpPage = (req, res, next) => {
  const filePath = path.join(rootDir, "views", "sign-up.html");

  //Sending the sign-up page as response
  res.sendFile(filePath);
};

/*
  Express route handler: Renders the login page.
*/
exports.getLoginPage = (req, res, next) => {
  const filePath = path.join(rootDir, "views", "login.html");

  //Sending the login page as response
  res.sendFile(filePath);
};

/*
  Handles a POST request to the /users/signup endpoint
  - Extracts user information (name, email, and password) from the request body.
  - Checks if the provided email already exists in the database.
    - If the email exists, returns a 409 status with an error message.
    - If the email is not found, hashes the provided password using bcrypt.
      - Creates a new user in the database with the hashed password.
  - Responds with a status:
    - 200 for successful sign-up, indicating a successful login.
    - 409 for conflicts, such as an email that is already taken.
    Benefits of using Sequelize transactions:
 
 Benefits of using `transaction t`:
- Ensures database consistency by grouping multiple database operations into a single transaction.
 Benefits of using `t.commit()`:
 - Finalizes the transaction if all operations within it are successful.
 Benefits of using `t.rollback()`:
  - Rolls back the transaction, undoing any changes made within the transaction.  
*/
exports.postUserSignUp = async (req, res, next) => {
  // Start a Sequelize transaction to ensure database consistency
  const t = await sequelize.transaction();
  try {
    //extract data from the request body
    const name = req.body.nameValue;
    const email = req.body.emailValue;
    const password = req.body.passwordValue;

    //Check if the user already exists
    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      return res.status(409).json({
        error: "This email is already taken. Please choose another one.",
      });
    }

    //Hash the password using bcrypt and create a new user in the database(saltrounds = 10 )
    //saltrounds=> cost factor of the hashing algorithm
    bcrypt.hash(password, 10, async (err, hash) => {
      await User.create({
        name: name,
        email: email,
        password: hash,
        transaction: t, // Pass the transaction to the query
      });
    });
    // Commit the transaction if all operations are successful
    await t.commit();
    //Send a success response
    res.status(200).json({
      success: true,
      message: "Signup Successful!",
    });
  } catch (err) {
    console.error(err);

    // Rollback the transaction if there's an error
    await t.rollback();

    //send an error response
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/*
  Handles a POST request to the users/login endpoint
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
    //Extract user email and password
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
