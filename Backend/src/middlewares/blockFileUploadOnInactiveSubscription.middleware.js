import Subscription from "../models/subscription.model.js";
import ApiError from "../helpers/apiError.js";
import { PLANS } from "../config/plans.js";

export default async function blockFileUploadOnInactiveSubscription(
  req,
  res,
  next,
) {
  const userId = req.targetUserId || req.session.user._id.toString();
  const subscription = await Subscription.findOne({ user: userId }).lean();
  if (
    subscription?.razorpaySubscriptionId &&
    subscription.status !== "active"
  ) {
    if (["paused", "past_due", "in_grace"].includes(subscription.status)) {
      throw new ApiError(
        403,
        "Upload not allowed due to inactive subscription!",
      );
    }

    // checks if file uploads allowed even on plan cancellation
    const shouldAllowOnCancel =
      subscription.status === "cancelled" &&
      subscription.cancelAtPeriodEnd &&
      subscription.graceEndsAt > new Date();

    // limit user's maxStorage as free plan
    if (subscription.status === "awaiting_activation" || !shouldAllowOnCancel) {
      req.userStorageEffectiveQuota = PLANS.free.storageQuotaBytes;
    }
  }
  next();
}
