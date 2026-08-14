import { NextResponse } from "next/server";

export async function GET() {
  try {
    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, ""); // Fixed: properly strip trailing slash

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64"), // Fixed interpolation
      "Content-Type": "application/json",
    };

    // 1. Fetch Categories
    const categoriesRes = await fetch(
      `${baseUrl}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false`, // Fixed interpolation
      { headers, next: { revalidate: 3600 } }
    );
    const rawCategories = await categoriesRes.json();

    // 2. Fetch Perfect Brands (With Fallback)
    let rawBrands: any[] = [];
    try {
      let bRes = await fetch(`${baseUrl}/wp-json/wp/v2/pwb-brand?per_page=100`, { // Fixed interpolation
        headers,
        next: { revalidate: 3600 },
      });

      if (bRes.ok) {
        rawBrands = await bRes.json();
      }

      // Fallback if pwb-brand is empty
      if (!Array.isArray(rawBrands) || rawBrands.length === 0) {
        bRes = await fetch(`${baseUrl}/wp-json/wc/v3/products/brands?per_page=100`, { // Fixed interpolation
          headers,
          next: { revalidate: 3600 },
        });
        if (bRes.ok) {
          rawBrands = await bRes.json();
        }
      }
    } catch (e) {
      console.error("Error fetching brands:", e);
    }

    // PROCESS CATEGORIES HIERARCHY
    const categoriesMap: Record<string, { title: string; links: string[] }[]> = {};

    if (Array.isArray(rawCategories)) {
      const parentCategories = rawCategories.filter(
        (cat) => cat.parent === 0 && cat.slug !== "uncategorized"
      );

      parentCategories.forEach((parentCat) => {
        const childCategories = rawCategories.filter(
          (cat) => cat.parent === parentCat.id
        );

        const columns = childCategories.map((childCat) => {
          const subChildCategories = rawCategories.filter(
            (cat) => cat.parent === childCat.id
          );
          const links =
            subChildCategories.length > 0
              ? subChildCategories.map((sub) => sub.name)
              : [childCat.name];

          return {
            title: childCat.name,
            links: links,
          };
        });

        if (columns.length > 0) {
          categoriesMap[parentCat.name] = columns;
        }
      });
    }

    // PROCESS BRANDS
    const formattedBrands: { id: number; name: string; slug: string; logo: string }[] = [];

    if (Array.isArray(rawBrands)) {
      rawBrands.forEach((b: any) => {
        formattedBrands.push({
          id: b.id,
          name: b.name,
          slug: b.slug,
          logo: b.pwb_brand_image || b.brand_image || b.image?.src || "",
        });
      });
    }

    const popular = formattedBrands.slice(0, 12);
    const luxe = formattedBrands.slice(12);

    return NextResponse.json({
      categories: categoriesMap,
      brands: {
        popular: popular.length > 0 ? popular : formattedBrands,
        luxe: luxe,
      },
    });
  } catch (error: any) {
    console.error("MegaMenu API Error:", error);
    return NextResponse.json(
      { categories: {}, brands: { popular: [], luxe: [] } },
      { status: 500 }
    );
  }
}