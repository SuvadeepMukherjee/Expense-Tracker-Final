const path = require("path");

const rootDir = require("../util/path");

exports.getLeaderboardPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "leaderboard.html"));
};
