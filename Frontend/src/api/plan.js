import { apiGet, apiPost, apiPut } from "./client.js";

export const getPlans = () => apiGet("/plans");

export const createSubscription = (planKey) =>
  apiPost("/subscriptions", { planKey });

export const getSubscription = (options) => apiGet("/subscriptions", options);

export const cancelSubscription = (cancelAtPeriodEnd) =>
  apiPut("/subscriptions/cancel", { cancelAtPeriodEnd });

export const updateSubscription = (planKey) =>
  apiPut("/subscriptions/update", { planKey });

export const pauseSubscription = () => apiPut("/subscriptions/pause");

export const resumeSubscription = () => apiPut("/subscriptions/resume");
