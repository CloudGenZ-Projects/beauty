import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateWooOrder } from "@/lib/woocommerce";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export async function POST(req: Request) {
  try {
    const { session_id, order_id } = await req.json();

    if (!session_id || !order_id) {
      return NextResponse.json({ error: "Missing Parameters" }, { status: 400 });
    }

    // Check Stripe session status
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Payment successful, update WooCommerce
      await updateWooOrder(order_id, {
        status: "processing", // Woo emails get triggered here
        set_paid: true,
      });

      return NextResponse.json({ success: true, status: "paid" });
    } else {
      return NextResponse.json({ success: false, status: session.payment_status });
    }
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}