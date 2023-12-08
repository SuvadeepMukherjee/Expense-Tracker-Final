const express = require("express");

const router = express.Router();

const expenseController = require("../controllers/expenseController");
const userAuthentication = require("../middleware/auth");

router.get("/", expenseController.getHomePage);
router.post("/addExpense", userAuthentication, expenseController.addExpense);
router.get(
  "/getAllExpenses",
  userAuthentication,
  expenseController.getAllExpenses
);
router.get(
  "/deleteExpense/:id",
  userAuthentication,
  expenseController.deleteExpense
);
module.exports = router;
