import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      billing,
      shipping,
      payment_method = "stripe",
      payment_method_title = "Credit/Debit Card (Stripe)",
      coupon_lines = [],
      customer_id = 0,
    } = body;

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, "");

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
    const stripeCurrency = (process.env.STRIPE_CURRENCY || "inr").toLowerCase();

    if (!baseUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: "WooCommerce API credentials missing in environment variables" },
        { status: 500 }
      );
    }

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64"),
      "Content-Type": "application/json",
    };

    const line_items = (items || []).map((item: any) => ({
      product_id: item.id || item.product_id,
      quantity: item.quantity || 1,
    }));

    // STRIPE ONLINE PAYMENT
    if (
      (payment_method === "stripe" || payment_method === "card" || payment_method === "online") &&
      stripeSecretKey
    ) {
      // 1. Create WooCommerce Pending Order
      const wooOrderPayload = {
        payment_method: "stripe",
        payment_method_title: "Credit/Debit Card (Stripe)",
        set_paid: false,
        status: "pending",
        billing: billing || {},
        shipping: shipping || billing || {},
        line_items: line_items,
        coupon_lines: coupon_lines,
        customer_id: Number(customer_id) || 0,
      };

      const wooRes = await fetch(`${baseUrl}/wp-json/wc/v3/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(wooOrderPayload),
      });

      const wooOrder = await wooRes.json();

      if (!wooRes.ok) {
        return NextResponse.json(
          { error: wooOrder.message || "Failed to create order in WooCommerce" },
          { status: wooRes.status }
        );
      }

      // 2. Create Stripe Checkout Session
      const origin = request.headers.get("origin") || "http://localhost:3000";

      const stripeParams = new URLSearchParams();
      stripeParams.append("payment_method_types[0]", "card");
      stripeParams.append("mode", "payment");
      stripeParams.append(
        "success_url",
        `${origin}/thank-you?order_id=${wooOrder.id}&session_id={CHECKOUT_SESSION_ID}`
      );
      stripeParams.append("cancel_url", `${origin}/checkout?canceled=true`);
      stripeParams.append("client_reference_id", String(wooOrder.id));

      if (billing?.email) {
        stripeParams.append("customer_email", billing.email);
      }

      // Append Line Items to Stripe
      (items || []).forEach((item: any, idx: number) => {
        const unitAmountInSmallestUnit = Math.round(Number(item.price) * 100);
        stripeParams.append(`line_items[${idx}][price_data][currency]`, stripeCurrency);
        stripeParams.append(
          `line_items[${idx}][price_data][product_data][name]`,
          item.name || "Beauty Product"
        );
        stripeParams.append(
          `line_items[${idx}][price_data][unit_amount]`,
          String(unitAmountInSmallestUnit)
        );
        stripeParams.append(`line_items[${idx}][quantity]`, String(item.quantity || 1));
      });

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: stripeParams.toString(),
      });

      const stripeSession = await stripeRes.json();

      if (!stripeRes.ok) {
        console.error("Stripe Session Error:", stripeSession);
        return NextResponse.json(
          { error: stripeSession.error?.message || "Stripe Payment Initialization Failed" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        url: stripeSession.url,
      });
    }

    // COD Flow
    const orderPayload = {
      payment_method: payment_method,
      payment_method_title: payment_method_title,
      set_paid: false,
      billing: billing || {},
      shipping: shipping || billing || {},
      line_items: line_items,
      coupon_lines: coupon_lines,
      customer_id: Number(customer_id) || 0,
    };

    const wooRes = await fetch(`${baseUrl}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(orderPayload),
    });

    const wooOrder = await wooRes.json();

    if (!wooRes.ok) {
      return NextResponse.json(
        { error: wooOrder.message || "Failed to create order in WooCommerce" },
        { status: wooRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: wooOrder.id,
      url: `/thank-you?order_id=${wooOrder.id}`,
    });
  } catch (error: any) {
    console.error("Checkout POST Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during checkout" },
      { status: 500 }
    );
  }
}