const express = require("express");
const router = express.Router();
const auth = require("./middlewares/auth");
const checkFeature = require("./middlewares/checkFeature");

const {
  createCheckoutSession,
  getSubscriptionStatus,
  getplans,
  handleStripeWebhook,
} = require("./controllers/subscriptionstripe/subscriptionsController");

// ✅ Create a Stripe subscription checkout
router.post("/create-checkout-session", auth, createCheckoutSession);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // raw body needed before signature check
  handleStripeWebhook
);

// ✅ Get user's subscription status
router.get("/status", auth, getSubscriptionStatus);

router.get("/getplans", auth, getplans);

// ✅ Example: Route with specific feature protection (like PDF download)
router.get("/export-data", auth, checkFeature("downloadPDF"), (req, res) => {
  res.json({ message: "Here is your PDF export data." });
});

// ✅ Example: Advanced analytics feature
router.get("/analytics", auth, checkFeature("analytics"), (req, res) => {
  res.json({ message: "Welcome to advanced analytics." });
});

// ✅ BONUS: Dynamic route to protect *any* feature using a single endpoint
router.get("/feature/:featureKey", auth, (req, res, next) => {
  const featureKey = req.params.featureKey;
  const checkFeature = require("./middlewares/checkFeature");
  checkFeature(featureKey)(req, res, () => {
    res.json({ message: `Feature "${featureKey}" is accessible.` });
  });
});

module.exports = router;
