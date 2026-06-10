import { PLANS, PLAN_KEYS } from "../config/plans.js";
import formatSize from "../helpers/formatSize.js";


export const getPlans = (req, res) => {
  // Group plans by display name for the frontend
  const planGroups = {};

  for (const plan of Object.values(PLANS)) {
    const {
      displayName,
      billingCycle,
      storageQuotaBytes,
      priceInPaise,
      planKey,
    } = plan;

    if (!planGroups[displayName]) {
      planGroups[displayName] = {
        displayName,
        storage: formatSize(storageQuotaBytes),
        storageBytes: storageQuotaBytes,
        variants: {},
      };
    }

    planGroups[displayName].variants[billingCycle || "free"] = {
      planKey,
      billingCycle,
      priceInPaise,
    };
  }

  // Return as an ordered array
  const orderedNames = ["Free", "Basic", "Standard", "Pro"];
  const plans = orderedNames
    .filter((name) => planGroups[name])
    .map((name) => planGroups[name]);

  res.json({ plans });
};

/*
  {
    plans:[
      {
        displayName:"Free",
        storage:"100MB",
        storageBytes:100*1024**2,
        variants:{
          "free":{
            planKey:"free",
            billingCycle:null,
            priceInPaise:0
          }
        }
      }      
    ]
  }
*/
