const express = require("express");

const router = express.Router();
const userController = require("../controllers/userController");
const expenseController = require("../controllers/expenseController");
const userAuthentication = require("../middleware/auth");

router.get("/", userController.getSignUpPage);
router.get("/signup", userController.getSignUpPage);
router.get("/login", userController.getLoginPage);
router.post("/signup", userController.postUserSignUp);
router.post("/login", userController.postUserLogin);
router.get("/isPremiumUser", userAuthentication, userController.isPremiumUser);
router.get("/getAllUsers", userController.getAllUsers);
router.get("/download", userAuthentication, expenseController.downloadExpense);

module.exports = router;
