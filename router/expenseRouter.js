const express = require("express");

//creates a modular, mountable set of routes for an Express.js application.
// It allows you to organize routes and their handlers in a separate file
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const userAuthentication = require("../middleware/auth");

//serve static files on the public folder
router.use(express.static("public"));

router.get("/", expenseController.getHomePage);
router.get(
  "/getAllExpenses",
  userAuthentication,
  expenseController.getAllExpenses
);
router.get(
  "/getAllExpenses/:page",
  userAuthentication,
  expenseController.getAllExpensesforPagination
);

//Including :id in the route path allows these routes to capture the  ID from the URL.
//This ID is then used to identify the specific expense to be deleted or edited.
router.get(
  "/deleteExpense/:id",
  userAuthentication,
  expenseController.deleteExpense
);

router.post("/addExpense", userAuthentication, expenseController.addExpense);
router.post(
  "/editExpense/:id",
  userAuthentication,
  expenseController.editExpense
);

module.exports = router;
