import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Next.js 15 Promise Unwrap Fix
    const { slug } = await params;

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, "");

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64"),
      "Content-Type": "application/json",
    };

    // 1. Fetch Brand Info from Perfect Brands
    const brandRes = await fetch(`${baseUrl}/wp-json/wp/v2/pwb-brand?slug=${slug}`, {
      headers,
    });
    const brandsData = await brandRes.json();

    if (!Array.isArray(brandsData) || brandsData.length === 0) {
      return NextResponse.json({ brand: null, products: [] });
    }

    const brand = brandsData[0];

    // 2. Fetch All Products of this Brand
    const productsRes = await fetch(
      `${baseUrl}/wp-json/wc/v3/products?pwb-brand=${brand.id}&per_page=100`,
      { headers }
    );
    const products = await productsRes.json();

    return NextResponse.json({
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        logo: brand.pwb_brand_image || brand.brand_image || "",
      },
      products: Array.isArray(products) ? products : [],
    });
  } catch (error: any) {
    console.error("Brand API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}