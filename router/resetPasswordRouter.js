const express = require("express");
//creates a modular, mountable set of routes for an Express.js application.
// It allows you to organize routes and their handlers in a separate file
const router = express.Router();

const resetPasswordController = require("../controllers/resetPasswordController");

router.get("/forgotPasswordPage", resetPasswordController.forgotPasswordPage);
router.post("/sendMail", resetPasswordController.sendMail);
router.get(
  "/resetPasswordPage/:requestId",
  resetPasswordController.resetPasswordPage
);
router.post("/resetPassword", resetPasswordController.updatePassword);

module.exports = router;
