import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email"); // Email parameter added

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim(); 
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, "");

    const headers = {
      'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
      'Content-Type': 'application/json'
    };

    // 1. Try to fetch orders by Customer ID
    let wpResponse = await fetch(`${baseUrl}/wp-json/wc/v3/orders?customer=${userId}`, {
      method: 'GET',
      headers,
      next: { revalidate: 0 }
    });

    let orders = await wpResponse.json();

    // 2. If no orders found by ID, try searching by Email (Catches Guest checkouts)
    if ((!orders || orders.length === 0) && email) {
      const emailResponse = await fetch(`${baseUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers,
        next: { revalidate: 0 }
      });
      orders = await emailResponse.json();
    }

    // Ensure it's an array
    if (!Array.isArray(orders)) {
      orders = [];
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Orders Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}