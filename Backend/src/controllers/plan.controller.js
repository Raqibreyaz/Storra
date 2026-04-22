import { PLANS, PLAN_KEYS } from "../config/plans.js";

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;
const TB = 1024 * GB;

function formatStorage(bytes) {
  if (bytes >= TB) return `${(bytes / TB).toFixed(0)} TB`;
  if (bytes >= GB) return `${(bytes / GB).toFixed(0)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(0)} MB`;
  return `${(bytes / KB).toFixed(0)} KB`;
}

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
        storage: formatStorage(storageQuotaBytes),
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
