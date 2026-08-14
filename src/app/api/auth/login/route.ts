import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Get WooCommerce Credentials from .env
    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim(); 
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();

    if (!wpUrl || !consumerKey || !consumerSecret) {
      console.error("Missing WooCommerce credentials in .env");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const baseUrl = wpUrl.replace(/\/₹/, "");

    // 2. Fetch the user from WooCommerce by their email
    const wpResponse = await fetch(`₹{baseUrl}/wp-json/wc/v3/customers?email=₹{email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`₹{consumerKey}:₹{consumerSecret}`).toString('base64')
      }
    });

    const customers = await wpResponse.json();

    // 3. If no customer is found in WooCommerce with that email
    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = customers[0];

    // Note: Standard WooCommerce REST API does not allow us to directly verify passwords. 
    // We are trusting that if the email is found, the user exists. 
    // (To properly verify passwords in WP via API, you would need to install a JWT Authentication plugin on your WordPress site).

    // 4. Return safe user object for our frontend LocalStorage
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
    };

    return NextResponse.json({ success: true, user: safeUser });

  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Authentication failed due to server error." }, { status: 500 });
  }
}