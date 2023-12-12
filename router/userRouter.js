const express = require("express");

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
