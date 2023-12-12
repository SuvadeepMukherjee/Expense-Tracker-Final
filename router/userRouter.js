const express = require("express");

//creates a modular, mountable set of routes for an Express.js application.
// It allows you to organize routes and their handlers in a separate file
const router = express.Router();
const userController = require("../controllers/userController");
const userAuthentication = require("../middleware/auth");

router.get("/", userController.getSignUpPage);
router.get("/signup", userController.getSignUpPage);
router.get("/login", userController.getLoginPage);
router.post("/signup", userController.postUserSignUp);
router.post("/login", userController.postUserLogin);
router.get("/isPremiumUser", userAuthentication, userController.isPremiumUser);

module.exports = router;
