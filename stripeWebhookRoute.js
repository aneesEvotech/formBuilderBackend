const express = require("express");
const {
  handleStripeWebhook,
} = require("./controllers/subscriptionstripe/subscriptionsController");
const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }), 
  handleStripeWebhook
);

module.exports = router;
