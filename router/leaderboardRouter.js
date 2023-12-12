const express = require("express");
//creates a modular, mountable set of routes for an Express.js application.
// It allows you to organize routes and their handlers in a separate file
const router = express.Router();

const leaderboardController = require("../controllers/leaderboardController");
router.get("/getLeaderboardPage", leaderboardController.getLeaderboardPage);
router.get("/getAllUsers", leaderboardController.getAllUsers);

module.exports = router;
