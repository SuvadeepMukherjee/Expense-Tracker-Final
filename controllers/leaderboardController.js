const path = require("path");

//directory name of main modules file name(app.js)
const rootDir = require("../util/path");
const User = require("../models/userModel");
//creates a connection to the database
const sequelize = require("../util/database");

/**
 * getLeaderboardPage controller
 * - Sends the leaderboard.html file as a response to the client.
 * - Uses the path module to construct the file path for the leaderboard.html file.
 */
exports.getLeaderboardPage = (req, res, next) => {
  const filePath = path.join(rootDir, "views", "leaderboard.html");

  //Sending the leaderboard page as response
  res.sendFile(filePath);
};

/**
 * getAllUsers controller
 * -handles a GET request to the users/getAllUsers Endpoint
 * - we make a GET request to this controller from the leaderboardPage
 * - Retrieves all users from the database, including their names and total expenses.
 * - Utilizes Sequelize to perform a query on the User model.
 *   - Selects specific attributes (name, totalExpenses) from the database.
 *   - Orders the results based on total expenses in descending order.
 * - Maps the retrieved user data into a more concise format.
 * - Mapping the retreived user data is crucial for simplifying client-side logic
 * - Sends a JSON (array of objects)response to the client containing the formatted user data.\
 * - sequelize's findAll is inherently asynchronous, our code handles it using a Promise-based approach
 * - with a .then() block, making the overall code asynchronous.
 *
 */
exports.getAllUsers = (req, res, next) => {
  try {
    // Use Sequelize to query the database for all users
    User.findAll({
      // Select specific attributes (name, totalExpenses) from the User model
      attributes: [
        [sequelize.col("name"), "name"],
        [sequelize.col("totalExpenses"), "totalExpenses"],
      ],
      // Order the results based on total expenses in descending order
      order: [[sequelize.col("totalExpenses"), "DESC"]],
    }).then((users) => {
      // Format the user data for response
      const result = users.map((user) => ({
        name: user.getDataValue("name"),
        totalExpenses: user.getDataValue("totalExpenses"),
      }));

      // Send a JSON response containing the formatted user data
      res.send(result);
    });
  } catch (error) {
    // Log any errors that occur during the process
    console.log("An error occurred while fetching user data:", error);
  }
};
