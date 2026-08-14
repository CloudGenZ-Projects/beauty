import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim(); 
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/₹/, "");

    // Fetch orders for this specific customer
    const wpResponse = await fetch(`₹{baseUrl}/wp-json/wc/v3/orders?customer=₹{userId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`₹{consumerKey}:₹{consumerSecret}`).toString('base64')
      },
      next: { revalidate: 0 }
    });

    if (!wpResponse.ok) throw new Error("Failed to fetch orders");

    const orders = await wpResponse.json();
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}