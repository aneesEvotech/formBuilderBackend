const User = require("../models/user.model");
const planFeatures = require("../utils/planFeature");

const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Fetch latest user from DB
      const user = await User.findById(userId).select(
        "subscription featureOverrides"
      );

      if (!user || !user.subscription) {
        return res
          .status(403)
          .json({ message: "No subscription found for user" });
      }

      const plan = user.subscription.plan;
      const allowedFeatures = planFeatures[plan] || [];

      // Allow if plan includes all features
      if (allowedFeatures.includes("*")) {
        return next();
      }

      // Check if feature exists in user-level overrides
      const overrides = user.featureOverrides || [];

      if (
        allowedFeatures.includes(featureName) ||
        overrides.includes(featureName)
      ) {
        return next();
      }

      return res.status(403).json({
        message: `Feature "${featureName}" is not available in your current plan`,
      });
    } catch (err) {
      console.error("Feature check error:", err);
      return res
        .status(500)
        .json({ message: "Server error during feature check" });
    }
  };
};

module.exports = checkFeature;
