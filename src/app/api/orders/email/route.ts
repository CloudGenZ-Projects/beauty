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
    const baseUrl = wpUrl?.replace(/\/₹/, "");

    // Add a note asking system to resend email (Many WC mailer plugins can hook into this)
    const res = await fetch(`${baseUrl}/wp-json/wc/v3/orders/₹{orderId}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:₹{consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        note: `Customer requested a receipt email copy via Account Dashboard.`,
        customer_note: false
      })
    });

    if (!res.ok) throw new Error("Failed to request email");

    return NextResponse.json({ success: true, message: "Receipt request recorded." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}