import Razorpay from "razorpay";

const rzp = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

const plans = await rzp.plans.all();

const ps = plans.items.map((p) => ({
  id: p.id,
  period: p.period,
  description: p.item.description,
  amount: p.item.amount,
  name: p.item.name,
}));
console.log(JSON.stringify(ps, null, 2));
