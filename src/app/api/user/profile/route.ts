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

    if (!wpUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const baseUrl = wpUrl.replace(/\/$/, "");

    const wpResponse = await fetch(`${baseUrl}/wp-json/wc/v3/customers/${userId}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64"),
      },
      cache: "no-store",
    });

    if (!wpResponse.ok) {
      throw new Error("Failed to fetch customer profile");
    }

    const customer = await wpResponse.json();
    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
