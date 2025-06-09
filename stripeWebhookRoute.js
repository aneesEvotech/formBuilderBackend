const express = require("express");
const { handleStripeWebhook } = require("./controllers/subscriptionstripe/subscriptionsController");
const router = express.Router();

router.post("/", handleStripeWebhook);

module.exports = router;
