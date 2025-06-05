const PLAN_FEATURES = require("./planFeature");

function getFeaturesForPlan(plan) {
  const features = PLAN_FEATURES[plan];
  if (!features) return [];
  if (features.includes("*")) return "ALL";
  return features;
}

module.exports = { getFeaturesForPlan };
