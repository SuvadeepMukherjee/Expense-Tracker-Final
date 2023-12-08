const express = require("express");
const router = express.Router();

const resetPasswordControler = require("../controllers/resetPasswordController");

router.get("/forgotPasswordPage", resetPasswordControler.forgotPasswordPage);
router.post("/sendMail", resetPasswordControler.sendMail);
module.exports = router;
