import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateWooOrder } from "@/lib/woocommerce";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ₹{err.message}` }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const wooOrderId = session.metadata?.wooOrderId;

    if (wooOrderId) {
      try {
        // Update WooCommerce order to paid
        await updateWooOrder(wooOrderId, { 
          status: "processing", // Or 'completed'
          set_paid: true,
          transaction_id: session.payment_intent as string
        });
        console.log(`Order ₹{wooOrderId} updated to processing.`);
      } catch (error) {
        console.error("Failed to update WooCommerce Order:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}