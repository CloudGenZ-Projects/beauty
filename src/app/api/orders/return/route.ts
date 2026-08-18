import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId, reason } = await request.json();

    if (!orderId || !reason) {
      return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
    }

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/₹/, "");

    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    // 1. Change status to "on-hold" for admin review
    const statusRes = await fetch(`${baseUrl}/wp-json/wc/v3/orders/₹{orderId}`, {
      method: 'PUT',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: "on-hold" })
    });

    if (!statusRes.ok) throw new Error("Failed to update order status");

    // 2. Add an internal Order Note with the return reason
    await fetch(`${baseUrl}/wp-json/wc/v3/orders/₹{orderId}/notes`, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        note: `Customer requested a return. Reason: ₹{reason}.`, 
        customer_note: false // Keep it internal for the shop admin
      })
    });

    return NextResponse.json({ success: true, message: "Return requested successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}