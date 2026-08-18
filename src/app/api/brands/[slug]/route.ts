import { NextResponse } from "next/server";

// Disable Next.js caching for this route
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/₹/, "");

    if (!baseUrl) {
      return NextResponse.json({ error: "Base URL missing" }, { status: 500 });
    }

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64"),
      "Content-Type": "application/json",
    };

    // 1. Fetch Brand Info
    let brand: any = null;
    const brandEndpoints = [
      `${baseUrl}/wp-json/wp/v2/pwb-brand?slug=${slug}`,
      `${baseUrl}/wp-json/wc/v3/products/brands?slug=${slug}`,
      `${baseUrl}/wp-json/wp/v2/product_brand?slug=${slug}`,
      `${baseUrl}/wp-json/wp/v2/brand?slug=${slug}`,
    ];

    for (const url of brandEndpoints) {
      try {
        const res = await fetch(url, { headers, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            brand = data[0];
            break;
          }
        }
      } catch (e) {}
    }

    // Fallback: Scan brand terms list
    if (!brand) {
      for (const tax of ["pwb-brand", "product_brand", "brand"]) {
        try {
          const res = await fetch(`${baseUrl}/wp-json/wp/v2/${tax}?per_page=100`, { headers, cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const matched = data.find(
                (b: any) =>
                  b.slug?.toLowerCase() === slug.toLowerCase() ||
                  b.name?.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
              );
              if (matched) {
                brand = matched;
                break;
              }
            }
          }
        } catch (e) {}
      }
    }

    if (!brand) {
      return NextResponse.json({ brand: null, products: [], otherProducts: [] });
    }

    // Extract Logo
    let logoUrl = brand.pwb_brand_image || brand.brand_image || brand.image?.src || brand.logo || "";
    if (typeof logoUrl === "object" && logoUrl?.src) {
      logoUrl = logoUrl.src;
    }

    // 2. Fetch All WooCommerce Products
    let allWcProducts: any[] = [];
    try {
      const wcRes = await fetch(`${baseUrl}/wp-json/wc/v3/products?per_page=100`, { headers, cache: "no-store" });
      if (wcRes.ok) {
        const wcData = await wcRes.json();
        if (Array.isArray(wcData)) {
          allWcProducts = wcData;
        }
      }
    } catch (e) {}

    // 3. STRICT FILTERING USING PRODUCT'S `BRANDS` ARRAY
    const brandId = Number(brand.id);
    const brandSlugLower = String(brand.slug || "").toLowerCase().trim();
    const brandNameLower = String(brand.name || "").toLowerCase().trim();

    const matchedProducts = allWcProducts.filter((p: any) => {
      // Check product.brands array (Standard WooCommerce Brands format)
      if (Array.isArray(p.brands) && p.brands.length > 0) {
        const isMatched = p.brands.some((b: any) => {
          const bId = Number(b.id);
          const bSlug = String(b.slug || "").toLowerCase().trim();
          const bName = String(b.name || "").toLowerCase().trim();

          return (
            (bId > 0 && bId === brandId) ||
            (bSlug.length > 0 && bSlug === brandSlugLower) ||
            (bName.length > 0 && bName === brandNameLower)
          );
        });
        if (isMatched) return true;
      }

      // Check pwb_brand property
      if (p.pwb_brand) {
        if (typeof p.pwb_brand === "object") {
          if (Number(p.pwb_brand.id) === brandId || String(p.pwb_brand.slug).toLowerCase() === brandSlugLower) {
            return true;
          }
        } else if (Number(p.pwb_brand) === brandId) {
          return true;
        }
      }

      // Check meta_data array
      if (Array.isArray(p.meta_data)) {
        const metaMatch = p.meta_data.some((m: any) => {
          const key = String(m.key || "").toLowerCase();
          if (key === "pwb_brand" || key === "_pwb_brand" || key === "brand" || key === "_brand") {
            return Number(m.value) === brandId || String(m.value).toLowerCase() === brandSlugLower;
          }
          return false;
        });
        if (metaMatch) return true;
      }

      return false;
    });

    // 4. Determine final output
    let products: any[] = [];
    let otherProducts: any[] = [];

    if (matchedProducts.length > 0) {
      products = matchedProducts;
    } else {
      // Brand has 0 matching products -> return 8 other products for recommendations
      otherProducts = allWcProducts.slice(0, 8);
    }

    return NextResponse.json({
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        logo: logoUrl,
      },
      products,
      otherProducts,
    });
  } catch (error: any) {
    console.error("Brand API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}