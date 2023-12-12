const express = require("express");
const router = express.Router();

const leaderboardController = require("../controllers/leaderboardController");
router.get("/getLeaderboardPage", leaderboardController.getLeaderboardPage);
router.get("/getAllUsers", leaderboardController.getAllUsers);

module.exports = router;
