const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const User = require("../../models/user.model");
const { getFeaturesForPlan } = require("../../utils/featureResolver");

const statusMap = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  canceled: "cancelled",
  incomplete_expired: "inactive",
};

const getPeriodDates = (subscription) => {
  let latestStart = null; // seconds-epoch
  let earliestEnd = null; // seconds-epoch

  for (const { current_period_start: s, current_period_end: e } of subscription
    ?.items?.data || []) {
    if (typeof s === "number") {
      latestStart = latestStart === null ? s : Math.max(latestStart, s);
    }

    if (typeof e === "number") {
      earliestEnd = earliestEnd === null ? e : Math.min(earliestEnd, e);
    }
  }

  return {
    start: latestStart !== null ? new Date(latestStart * 1000) : null,
    end: earliestEnd !== null ? new Date(earliestEnd * 1000) : null,
  };
};

const toDate = (unix) => (unix ? new Date(unix * 1000) : null);

const createCheckoutSession = async (req, res) => {
  try {
    const user = req.user;
    const { plan } = req.body;
    // Create Stripe customer if not exists

    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription-success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
      metadata: { userId: user._id.toString(), plan },
      expand: ["subscription", "subscription.items.data"],
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to create checkout session" + err });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("subscription");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const features = getFeaturesForPlan(user.subscription.plan);

    return res.status(200).json({
      subscription: user.subscription,
      features: features === "ALL" ? "ALL" : features,
    });
  } catch (err) {
    console.error("Get Subscription Status Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to get subscription status" });
  }
};

const getplans = async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    if (prices.data.length === 0) {
      return res.status(404).json({ error: "No active prices found" });
    }

    const formatted = prices.data.map((price) => ({
      id: price.id,
      nickname: price.nickname || price.product.name,
      amount: (price.unit_amount / 100).toFixed(2),
      currency: price.currency.toUpperCase(),
      interval: price.recurring?.interval || "one_time",
      product: price.product.name,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Stripe price fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
};

const handleStripeWebhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const userId = s.metadata.userId;
        const plan = s.metadata.plan || "pro plan";
        const session = event.data.object;

        const subscription = session.subscription?.items
          ? session.subscription
          : await stripe.subscriptions.retrieve(session.subscription, {
              expand: ["items.data"],
            });
        const { start, end } = getPeriodDates(subscription);

        const user = await User.findById(userId);
        if (user) {
          user.subscription = {
            stripeCustomerId: s.customer,
            stripeSubscriptionId: s.subscription,
            plan,
            status: "active",
            startDate: start || new Date(),
            endDate: end,
          };
          user.isActive = true;
          await user.save();
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const { start, end } = getPeriodDates(sub);

        const user = await User.findOne({
          "subscription.stripeCustomerId": sub.customer,
        });
        if (!user) break;

        const status = statusMap[sub.status] || "inactive";
        const plan = status === "active" ? "pro plan" : "freemium";

        user.subscription.plan = plan;
        user.subscription.status = status;
        user.subscription.stripeSubscriptionId = sub.id;
        user.subscription.startDate = start;
        user.subscription.endDate = end;
        user.isActive = status === "active";
        await user.save();
        break;
      }

      default:
        return res.status(200).json({ skipped: true });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error processing Stripe webhook:", err);
    res.status(500).send("Webhook handler failed");
  }
};

module.exports = {
  createCheckoutSession,
  getSubscriptionStatus,
  handleStripeWebhook,
  getplans,
};
