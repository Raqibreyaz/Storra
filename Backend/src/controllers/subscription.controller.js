import Razorpay from "razorpay";
import {
  getPlanByKey,
  getPlanByRazorpayPlanId,
  getTotalBillingCycles,
} from "../config/plans.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import ApiError from "../helpers/apiError.js";

const rzp = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

export const createSubscription = async (req, res) => {
  const user = req.session.user;
  const { planKey } = req.body;

  const plan = getPlanByKey(planKey);
  const totalBillingCycles = getTotalBillingCycles(planKey);

  let subscriptionId = user.subscriptionId;

  const fetchedSubscription = subscriptionId
    ? await rzp.subscriptions.fetch(subscriptionId)
    : null;

  // TODO: Make these both Ops atomic
  if (!fetchedSubscription) {
    const subscription = await rzp.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      customer_notify: true,
      quantity: 1,
      total_count: totalBillingCycles,
      notes: {
        plan: plan.planKey,
        customerEmail: user.email,
      },
    });
    await Subscription.insertOne({
      razorpaySubscriptionId: subscription.id,
      user: user._id,
      billingCycle: plan.billingCycle,
      status: "awaiting_activation",
      plan: plan.razorpayPlanId,
    });
    await User.updateOne(
      { _id: user._id },
      { $set: { subscriptionId: subscription.id } },
    );

    subscriptionId = subscription.id;
  } else if (fetchedSubscription.status !== "created")
    throw new ApiError(400, "you are already subscribed!");

  res.json({
    apiKey: process.env.RZP_KEY_ID,
    subscriptionId: subscriptionId,
    businessName: "Storra",
    theme: {
      color: "#F37254",
    },
    prefill: {
      name: user.name,
      email: user.email,
      // contact: "9876543211", //TODO: give user's actual contact
    },
    notes: {
      plan: plan.planKey,
      userName: user.name,
    },
  });
};

export const getSubscription = async (req, res) => {
  const razorpaySubscriptionId = req.session.user.razorpaySubscriptionId;
  const subscription = await Subscription.findOne({ razorpaySubscriptionId })
    .select("-user")
    .lean();

  subscription.plan = getPlanByRazorpayPlanId(subscription.plan);

  res.json({ message: "success!", subscription });
};

// TODO: handle events for paused,resume etc
// TODO: store events in DB
export const razorpayWebhook = async (req, res) => {
  const bodyString = JSON.stringify(req.body);
  const signature = req.headers["x-razorpay-signature"];

  if (
    Razorpay.validateWebhookSignature(
      bodyString,
      signature,
      process.env.RZP_WEBHOOK_SECRET,
    )
  ) {
    const subscriptionEntity = req.body.payload.subscription.entity;

    const status = subscriptionEntity.status;
    const subscriptionId = subscriptionEntity.id;
    const planId = subscriptionEntity.plan_id;
    const eventType = req.body.event;

    const plan = getPlanByRazorpayPlanId(planId);

    console.log("event occured:");
    console.log(planId);
    console.log(plan.planKey);
    console.log(eventType);
    console.log(subscriptionId);

    switch (eventType) {
      case "subscription.activated":
        const daysLeftNextBilling = plan.billingCycle === "monthly" ? 30 : 365;

        await Subscription.updateOne(
          { razorpaySubscriptionId: subscriptionId },
          {
            $set: {
              status,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * daysLeftNextBilling,
              ),
            },
          },
        );
        break;

      // case "subcription.paused":
      //   await Subscription.updateOne(
      //     { razorpaySubscriptionId: subscriptionId },
      //     {
      //       $set: { status },
      //     },
      //   );
      //   break;

      // case "subcription.cancelled":
      //   await Subscription.updateOne(
      //     { razorpaySubscriptionId: subscriptionId },
      //     {
      //       $set: { status },
      //     },
      //   );
      //   break;

      // case "subscription.pending":
      //   break;

      case "subscription.halted":
        await Subscription.updateOne(
          { razorpaySubscriptionId: subscriptionId },
          {
            $set: { status: "in_grace" },
          },
        );
        break;

      default:
        break;
    }

    return res.sendStatus(200);
  }

  res.sendStatus(400);
};
