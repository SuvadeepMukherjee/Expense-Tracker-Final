const express = require("express");

const router = express.Router();
const userController = require("../controllers/userController");

router.get("/signup", userController.getSignUpPage);
router.get("/login", userController.getLoginPage);
router.post("/signup", userController.postUserSignUp);
router.post("/login", userController.postUserLogin);

module.exports = router;
