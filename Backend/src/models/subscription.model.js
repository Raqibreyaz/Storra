import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  razorpaySubscriptionId: {
    type: String,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
  status: {
    type: String,
    enum: [
      "awaiting_activation",
      "active",
      "past_due",
      "in_grace",
      "paused",
      "cancelled",
    ],
    required: true,
  },
  currentPeriodStart: {
    type: Date,
  },
  currentPeriodEnd: {
    type: Date,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
});

const Subscription = mongoose.model("Subscription", schema);

export default Subscription;
