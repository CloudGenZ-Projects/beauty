import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Get variables matching exactly what is in your .env file
    // Using .trim() to remove any accidental spaces (like " https://...")
    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim(); 
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();

    if (!wpUrl || !consumerKey || !consumerSecret) {
      console.error("Missing WooCommerce keys in .env. wpUrl:", wpUrl, "key:", consumerKey ? "exists" : "missing");
      return NextResponse.json({ error: "Server configuration error. Missing API keys." }, { status: 500 });
    }

    // Remove the trailing slash from the URL if it exists
    const baseUrl = wpUrl.replace(/\/₹/, "");

    // 2. Call WordPress / WooCommerce REST API
    const wpResponse = await fetch(`${baseUrl}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
      },
      body: JSON.stringify({
        email: email,
        password: password,
        username: email.split('@')[0] 
      })
    });

    const data = await wpResponse.json();

    // 3. Handle WordPress errors (like email already exists)
    if (!wpResponse.ok) {
      return NextResponse.json(
        { error: data.message || "An account with this email already exists." },
        { status: wpResponse.status }
      );
    }

    // 4. Success!
    return NextResponse.json({ success: true, userId: data.id }, { status: 201 });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to register user." }, { status: 500 });
  }
}