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

    // FIX 1: Replaced `₹` with `$` to target the end of the string in regex
    const baseUrl = wpUrl.replace(/\/$/, "");

    // FIX 2: Replaced `₹{}` with `${}` for template literals
    const wpResponse = await fetch(`${baseUrl}/wp-json/wc/v3/customers?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // FIX 3: Replaced `₹{}` with `${}` for the consumerSecret
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
      }
    });

    const customers = await wpResponse.json();

    // FIX 4: Better error handling. Catch API errors (like 401 Unauthorized) before accessing arrays
    if (!wpResponse.ok) {
      console.error("WooCommerce API Error:", customers);
      return NextResponse.json({ error: "Failed to communicate with WooCommerce." }, { status: wpResponse.status });
    }

    // 3. Ensure customers is an array and check if the email exists
    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = customers[0];

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