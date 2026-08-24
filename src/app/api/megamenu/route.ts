import { NextResponse } from "next/server";


const isHiddenCategory = (cat: any) => {
 
  const ACF_FIELD_NAME = "hide_category"; 

 
  if (cat.acf && cat.acf[ACF_FIELD_NAME] !== undefined) {
    const val = cat.acf[ACF_FIELD_NAME];
   
    if (val === true || val === "yes" || val === "1" || val === 1) return true;
  }

 
  if (Array.isArray(cat.meta_data)) {
    const meta = cat.meta_data.find((m: any) => m.key === ACF_FIELD_NAME);
    if (meta && (meta.value === "yes" || meta.value === "1" || meta.value === true || meta.value === 1)) {
      return true;
    }
  }

  return false;
};

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
    

   
    const categoriesRes = await fetch(
      `${baseUrl}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false`,
      { headers, next: { revalidate: 0 } } 
    );
    const rawCategories = await categoriesRes.json();

    if (Array.isArray(rawCategories) && rawCategories.length > 0) {
     
      if(rawCategories[0].meta_data) {
          console.log("Meta Data Keys:", rawCategories[0].meta_data.map((m: any)=> m.key).join(", "));
      }
      console.log("=======================================");
    }

    // 2. Fetch Brands (CACHE DISABLED FOR TESTING)
    let rawBrands: any[] = [];
    try {
      let bRes = await fetch(`${baseUrl}/wp-json/wp/v2/pwb-brand?per_page=100`, {
        headers,
        next: { revalidate: 0 },
      });

      if (bRes.ok) {
        rawBrands = await bRes.json();
      }

      if (!Array.isArray(rawBrands) || rawBrands.length === 0) {
        bRes = await fetch(`${baseUrl}/wp-json/wc/v3/products/brands?per_page=100`, {
          headers,
          next: { revalidate: 0 },
        });
        if (bRes.ok) {
          rawBrands = await bRes.json();
        }
      }
    } catch (e) {
      console.error("Error fetching brands:", e);
    }

    // PROCESS CATEGORIES
    const categoriesMap: Record<string, { title: string; links: string[] }[]> = {};

    if (Array.isArray(rawCategories)) {
      // Hide category filter apply
      const visibleCategories = rawCategories.filter((cat) => !isHiddenCategory(cat));

      const parentCategories = visibleCategories.filter(
        (cat) => cat.parent === 0 && cat.slug !== "uncategorized"
      );

      parentCategories.forEach((parentCat) => {
        const childCategories = visibleCategories.filter(
          (cat) => cat.parent === parentCat.id
        );

        const columns = childCategories.map((childCat) => {
          const subChildCategories = visibleCategories.filter(
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