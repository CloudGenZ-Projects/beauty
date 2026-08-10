import { NextResponse } from "next/server";

export async function GET() {
  try {
    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, "");

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64"),
      "Content-Type": "application/json",
    };

    // Parallel Request: Real WooCommerce Coupons + On-Sale Products
    const [couponsRes, productsRes] = await Promise.all([
      fetch(`${baseUrl}/wp-json/wc/v3/coupons?per_page=20`, {
        headers,
        next: { revalidate: 300 }, // Cache 5 mins
      }),
      fetch(`${baseUrl}/wp-json/wc/v3/products?on_sale=true&per_page=100`, {
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    const rawCoupons = couponsRes.ok ? await couponsRes.json() : [];
    const rawProducts = productsRes.ok ? await productsRes.json() : [];

    // Format WooCommerce Coupons Data
    const formattedCoupons = Array.isArray(rawCoupons)
      ? rawCoupons.map((c: any) => ({
          id: c.id,
          code: c.code?.toUpperCase(),
          amount: c.amount,
          discount_type: c.discount_type, // 'percent', 'fixed_cart', or 'fixed_product'
          description: c.description || "",
          minimum_amount: c.minimum_amount || "0",
          date_expires: c.date_expires || null,
        }))
      : [];

    return NextResponse.json({
      coupons: formattedCoupons,
      products: Array.isArray(rawProducts) ? rawProducts : [],
    });
  } catch (error: any) {
    console.error("Dynamic Offers API Error:", error);
    return NextResponse.json({ coupons: [], products: [] }, { status: 500 });
  }
}