const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;
const TB = 1024 * GB;

export const BILLING_CYCLES = Object.freeze({
  MONTHLY: "monthly",
  YEARLY: "yearly",
});

export const PLAN_KEYS = Object.freeze({
  FREE: "free",

  BASIC_MONTHLY: "basic_monthly",
  BASIC_YEARLY: "basic_yearly",

  STANDARD_MONTHLY: "standard_monthly",
  STANDARD_YEARLY: "standard_yearly",

  PRO_MONTHLY: "pro_monthly",
  PRO_YEARLY: "pro_yearly",
});

export const PLANS = Object.freeze({
  [PLAN_KEYS.FREE]: Object.freeze({
    planKey: PLAN_KEYS.FREE,
    displayName: "Free",
    billingCycle: null,
    storageQuotaBytes: 100 * MB,
    priceInPaise: 0,
    razorpayPlanId: null,
  }),

  [PLAN_KEYS.BASIC_MONTHLY]: Object.freeze({
    planKey: PLAN_KEYS.BASIC_MONTHLY,
    displayName: "Basic",
    billingCycle: BILLING_CYCLES.MONTHLY,
    storageQuotaBytes: 2 * TB,
    priceInPaise: 19900,
    razorpayPlanId: process.env.RZP_PLAN_BASIC_MONTHLY_ID || "",
  }),

  [PLAN_KEYS.BASIC_YEARLY]: Object.freeze({
    planKey: PLAN_KEYS.BASIC_YEARLY,
    displayName: "Basic",
    billingCycle: BILLING_CYCLES.YEARLY,
    storageQuotaBytes: 2 * TB,
    priceInPaise: 199900,
    razorpayPlanId: process.env.RZP_PLAN_BASIC_YEARLY_ID || "",
  }),

  [PLAN_KEYS.STANDARD_MONTHLY]: Object.freeze({
    planKey: PLAN_KEYS.STANDARD_MONTHLY,
    displayName: "Standard",
    billingCycle: BILLING_CYCLES.MONTHLY,
    storageQuotaBytes: 5 * TB,
    priceInPaise: 44900,
    razorpayPlanId: process.env.RZP_PLAN_STANDARD_MONTHLY_ID || "",
  }),

  [PLAN_KEYS.STANDARD_YEARLY]: Object.freeze({
    planKey: PLAN_KEYS.STANDARD_YEARLY,
    displayName: "Standard",
    billingCycle: BILLING_CYCLES.YEARLY,
    storageQuotaBytes: 5 * TB,
    priceInPaise: 399900,
    razorpayPlanId: process.env.RZP_PLAN_STANDARD_YEARLY_ID || "",
  }),

  [PLAN_KEYS.PRO_MONTHLY]: Object.freeze({
    planKey: PLAN_KEYS.PRO_MONTHLY,
    displayName: "Pro",
    billingCycle: BILLING_CYCLES.MONTHLY,
    storageQuotaBytes: 10 * TB,
    priceInPaise: 94900,
    razorpayPlanId: process.env.RZP_PLAN_PRO_MONTHLY_ID || "",
  }),

  [PLAN_KEYS.PRO_YEARLY]: Object.freeze({
    planKey: PLAN_KEYS.PRO_YEARLY,
    displayName: "Pro",
    billingCycle: BILLING_CYCLES.YEARLY,
    storageQuotaBytes: 10 * TB,
    priceInPaise: 920000,
    razorpayPlanId: process.env.RZP_PLAN_PRO_YEARLY_ID || "",
  }),
});

export function getPlanByKey(planKey) {
  return PLANS[planKey] || null;
}

export function isPaidPlan(planKey) {
  return planKey !== PLAN_KEYS.FREE;
}

export function getPaidPlans() {
  return Object.values(PLANS).filter((plan) => plan.planKey !== PLAN_KEYS.FREE);
}

export function getPlanByRazorpayPlanId(razorpayPlanId) {
  return (
    Object.values(PLANS).find(
      (plan) => plan.razorpayPlanId && plan.razorpayPlanId === razorpayPlanId,
    ) || null
  );
}

export function getTotalBillingCycles(planKey) {
  return getPlanByKey(planKey).billingCycle === BILLING_CYCLES.MONTHLY
    ? 120
    : 10;
}
