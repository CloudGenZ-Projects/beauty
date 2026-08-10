import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const wpUrl = (process.env.WC_URL || "").replace(/\/$/, "");
    const consumerKey = process.env.WC_CONSUMER_KEY || "";
    const consumerSecret = process.env.WC_CONSUMER_SECRET || "";

    if (!wpUrl) {
      console.error("[Search API] Missing WC_URL environment variable.");
      return NextResponse.json([]);
    }

    // WooCommerce Search API Call
    let endpoint = `${wpUrl}/wp-json/wc/v3/products?search=${encodeURIComponent(
      query.trim()
    )}&status=publish&per_page=10`;

    if (consumerKey && consumerSecret) {
      endpoint += `&consumer_key=${encodeURIComponent(
        consumerKey
      )}&consumer_secret=${encodeURIComponent(consumerSecret)}`;
    }

    const authHeader =
      "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const res = await fetch(endpoint, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[Search API Error] WooCommerce status code: ${res.status}`);
      return NextResponse.json([]);
    }

    const rawProducts = await res.json();

    if (!Array.isArray(rawProducts)) {
      console.error("[Search API Error] WooCommerce response is not an array");
      return NextResponse.json([]);
    }

    // Map WooCommerce products to lightweight live search suggestions
    const suggestions = rawProducts.map((p: any) => {
      const price = p.price || "0";
      const regularPrice = p.regular_price || p.price || "0";
      const isOnSale =
        Boolean(p.on_sale) ||
        (Boolean(p.regular_price) && Number(price) < Number(regularPrice));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug || String(p.id),
        price: price,
        regular_price: regularPrice,
        on_sale: isOnSale,
        image:
          p.images && p.images.length > 0 && p.images[0]?.src
            ? p.images[0].src
            : "/placeholder-image.png",
        category:
          p.categories && p.categories.length > 0 ? p.categories[0].name : "",
      };
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json([]);
  }
}