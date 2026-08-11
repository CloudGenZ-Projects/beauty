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
      shipping_cost = 0,
      shipping_method_title = "Standard Shipping",
      shipping_method_id = "flat_rate",
    } = body;

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, "");

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
    const stripeCurrency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

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

    // Product Line Items for WooCommerce
    const line_items = (items || []).map((item: any) => ({
      product_id: item.id || item.product_id,
      quantity: item.quantity || 1,
    }));

    // Shipping Line Item for WooCommerce
    const shipping_lines = [
      {
        method_id: shipping_method_id,
        method_title: shipping_method_title,
        total: String(Number(shipping_cost).toFixed(2)),
      },
    ];

    // Default Country to USA if missing
    if (billing && !billing.country) billing.country = "US";
    if (shipping && !shipping.country) shipping.country = "US";

    // STRIPE ONLINE PAYMENT
    if (
      (payment_method === "stripe" || payment_method === "card" || payment_method === "online") &&
      stripeSecretKey
    ) {
      // 1. Create Order in WooCommerce with Shipping Costs included
      const wooOrderPayload = {
        payment_method: "stripe",
        payment_method_title: "Credit/Debit Card (Stripe)",
        set_paid: false,
        status: "pending",
        billing: billing || {},
        shipping: shipping || billing || {},
        line_items: line_items,
        shipping_lines: shipping_lines,
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

      let lineItemIdx = 0;

      // Add Cart Products to Stripe Line Items
      (items || []).forEach((item: any) => {
        const unitAmountInCents = Math.round(Number(item.price) * 100);
        stripeParams.append(`line_items[${lineItemIdx}][price_data][currency]`, stripeCurrency);
        stripeParams.append(
          `line_items[${lineItemIdx}][price_data][product_data][name]`,
          item.name || "Product"
        );
        stripeParams.append(
          `line_items[${lineItemIdx}][price_data][unit_amount]`,
          String(unitAmountInCents)
        );
        stripeParams.append(`line_items[${lineItemIdx}][quantity]`, String(item.quantity || 1));
        lineItemIdx++;
      });

      // Add Shipping Fee Line Item to Stripe if shipping_cost > 0
      if (Number(shipping_cost) > 0) {
        const shippingInCents = Math.round(Number(shipping_cost) * 100);
        stripeParams.append(`line_items[${lineItemIdx}][price_data][currency]`, stripeCurrency);
        stripeParams.append(
          `line_items[${lineItemIdx}][price_data][product_data][name]`,
          shipping_method_title
        );
        stripeParams.append(
          `line_items[${lineItemIdx}][price_data][unit_amount]`,
          String(shippingInCents)
        );
        stripeParams.append(`line_items[${lineItemIdx}][quantity]`, "1");
        lineItemIdx++;
      }

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
        console.error("Stripe Checkout Session Error:", stripeSession);
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

    // Cash On Delivery (COD) Flow
    const orderPayload = {
      payment_method: payment_method,
      payment_method_title: payment_method_title,
      set_paid: false,
      billing: billing || {},
      shipping: shipping || billing || {},
      line_items: line_items,
      shipping_lines: shipping_lines,
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
    console.error("Checkout API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during checkout" },
      { status: 500 }
    );
  }
}