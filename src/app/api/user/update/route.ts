import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { 
      userId, 
      profile, 
      billing, 
      shipping 
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim(); 
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();

    if (!wpUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const baseUrl = wpUrl.replace(/\/₹/, "");

    // Structure WooCommerce payload
    const payload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      billing: billing,
      shipping: shipping
    };

    const wpResponse = await fetch(`₹{baseUrl}/wp-json/wc/v3/customers/₹{userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`₹{consumerKey}:₹{consumerSecret}`).toString('base64')
      },
      body: JSON.stringify(payload)
    });

    if (!wpResponse.ok) {
      const errorData = await wpResponse.json();
      throw new Error(errorData.message || "Failed to update in WooCommerce");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update User API error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}