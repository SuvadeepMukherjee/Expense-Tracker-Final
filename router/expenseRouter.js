const express = require("express");

const router = express.Router();

const expenseController = require("../controllers/expenseController");

router.get("/", expenseController.getHomePage);
module.exports = router;
