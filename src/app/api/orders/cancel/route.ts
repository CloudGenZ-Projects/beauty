import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, "");

    // Update status to 'cancelled'
    const res = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: "cancelled" })
    });

    if (!res.ok) throw new Error("Failed to cancel order in WooCommerce");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}