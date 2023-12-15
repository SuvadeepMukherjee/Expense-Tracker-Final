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
 * - Handles a GET request to the users/getAllUsers Endpoint.
 * - We make a GET request to this controller from the leaderboardPage.
 * - Utilizes Sequelize to perform a query on the User model.
 *   - Selects specific attributes (name, totalExpenses) from the database.
 *   - Orders the results based on total expenses in descending order.
 * - Maps the retrieved user data into a more concise format.
 * - Mapping the retrieved user data is crucial for simplifying client-side logic.
 * - Sends a JSON (array of objects) response to the client containing the formatted user data.
 *
 * Benefits of using Sequelize transactions:
 * - Ensures database consistency by grouping multiple database operations into a single transaction.
 * Benefits of using `transaction t`:
 * - Helps manage the state of the transaction and allows committing or rolling back as needed.
 * Benefits of using `t.commit()`:
 * - Finalizes the transaction if all operations within it are successful.
 * Benefits of using `t.rollback()`:
 * - Rolls back the transaction, undoing any changes made within the transaction.
 */

// Define the getAllUsers controller function
exports.getAllUsers = async (req, res, next) => {
  // Start a Sequelize transaction to ensure database consistency
  const t = await sequelize.transaction();
  try {
    // Use Sequelize to query the database for user data
    const users = await User.findAll({
      attributes: [
        [sequelize.col("name"), "name"],
        [sequelize.col("totalExpenses"), "totalExpenses"],
      ],
      order: [[sequelize.col("totalExpenses"), "DESC"]],
      transaction: t, // Pass the transaction to the query
    });

    // Map the retrieved user data into a more concise format
    const result = users.map((user) => ({
      name: user.getDataValue("name"),
      totalExpenses: user.getDataValue("totalExpenses"),
    }));

    // Commit the transaction if all operations are successful
    await t.commit();

    // Send a JSON response containing the formatted user data
    res.status(200).json(result);
  } catch (error) {
    // Log and handle errors
    console.error("Error in getAllUsers controller:", error);

    // Rollback the transaction if there's an error
    await t.rollback();

    // Send an error JSON response with a 500 status code
    res.status(500).json({ error: "Internal Server Error" });
  }
};
