import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json([]);
    }

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim().replace(/\/$/, ""); 
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();

    if (!wpUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json([]);
    }

    const wpResponse = await fetch(
      `${wpUrl}/wp-json/wc/v3/products/reviews?product=${productId}&per_page=100`, 
      {
        headers: { 
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64') 
        },
        cache: 'no-store'
      }
    );

    if (!wpResponse.ok) {
      return NextResponse.json([]);
    }

    const reviews = await wpResponse.json();

    return NextResponse.json(Array.isArray(reviews) ? reviews : []);

  } catch (error: any) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim().replace(/\/$/, ""); 
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();

    if (!wpUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json({ error: "WooCommerce API Keys missing in .env" }, { status: 500 });
    }

    const payload = {
      product_id: Number(body.product_id),
      reviewer: String(body.reviewer || "").trim(),
      reviewer_email: String(body.reviewer_email || "").trim(),
      review: String(body.review || "").trim(),
      rating: Number(body.rating) || 5,
      status: "approved"
    };

    console.log("Posting review to WooCommerce:", payload);

    const wpResponse = await fetch(`${wpUrl}/wp-json/wc/v3/products/reviews`, {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64') 
      },
      body: JSON.stringify(payload)
    });

    const resData = await wpResponse.json();

    if (!wpResponse.ok) {
      console.error("WooCommerce Review Error Response:", resData);
      return NextResponse.json(
        { error: resData.message || "WooCommerce rejected the review." }, 
        { status: wpResponse.status }
      );
    }

    return NextResponse.json(resData, { status: 201 });

  } catch (error: any) {
    console.error("POST Review Server Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}