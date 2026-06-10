// Shared subscription utilities used by Dashboard and Plans.
// Any subscription-status business logic that is needed in multiple
// components should live here to avoid drift between them.

import { FaCloud, FaShieldAlt, FaBolt, FaCrown } from "react-icons/fa";

// ─── Plan icons ────────────────────────────────────────────────────────────
// Single source of truth — previously duplicated in Dashboard.jsx and Plans.jsx.
export const PLAN_ICONS = {
  Free: FaCloud,
  Basic: FaShieldAlt,
  Standard: FaBolt,
  Pro: FaCrown,
};

/**
 * Returns true when a subscription should be treated as the free tier.
 *
 * A user is "effectively free" when:
 *  - They have no paid subscription at all, OR
 *  - Their subscription was cancelled immediately (no period-end grace), OR
 *  - Their subscription was cancelled at period-end AND the period has now expired.
 *
 * Previously computed inline in 3 different components — any future changes
 * only need to be made here.
 *
 * @param {object|null} subscription - The subscription object from the API.
 * @returns {boolean}
 */
export function isSubscriptionEffectivelyFree(subscription) {
  if (!subscription?.status) return true;

  if (subscription.status !== "cancelled") return false;

  // Cancelled-at-period-end: free only after the grace/period has expired
  if (subscription.cancelAtPeriodEnd) {
    const graceExpired =
      subscription.graceEndsAt &&
      new Date(subscription.graceEndsAt) <= new Date();
    return graceExpired;
  }

  // Cancelled immediately
  return true;
}
