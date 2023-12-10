const path = require("path");

const rootDir = require("../util/path");

/**
 * getLeaderboardPage controller
 * - Sends the leaderboard.html file as a response to the client.
 * - Uses the path module to construct the file path for the leaderboard.html file.
 */
exports.getLeaderboardPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "leaderboard.html"));
};
