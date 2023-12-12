const express = require("express");

const purchaseMembershipController = require("../controllers/purchaseMembershipController");

const authenticatemiddleware = require("../middleware/auth");

//creates a modular, mountable set of routes for an Express.js application.
// It allows you to organize routes and their handlers in a separate file
const router = express.Router();

router.get(
  "/premiumMembership",
  authenticatemiddleware,
  purchaseMembershipController.purchasePremium
);

router.post(
  "/updateTransactionStatus",
  authenticatemiddleware,
  purchaseMembershipController.updateTransactionStatus
);

module.exports = router;
