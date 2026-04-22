import { apiGet, apiPost } from "./client.js";

export const getPlans = () => apiGet("/plans");

export const createSubscription = (planKey) => apiPost("/subscriptions", { planKey });
