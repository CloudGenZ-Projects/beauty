// src/app/shop/page.tsx
import React from "react";
import ClientShop from "./ClientShop";
import { fetchProducts, fetchCategories } from "@/lib/woocommerce";

// Force dynamic taaki har baar URL ke according fresh data aaye
export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Next.js 15: searchParams ko await karna zaruri hai
  const params = await searchParams;
  const categorySlug = (params?.category as string) || "";

  let products = [];
  let categoryId = "";

  try {
    // 1. If a category is in the URL (e.g., "cosmatic"), we must find its Numeric ID first
    if (categorySlug) {
      const categories = await fetchCategories();
      
      // Find the matching category by slug (case-insensitive just in case)
      const matchedCategory = categories.find(
        (cat: any) => cat.slug.toLowerCase() === categorySlug.toLowerCase()
      );

      if (matchedCategory) {
        categoryId = String(matchedCategory.id);
      } else {
        // If the category doesn't exist at all, return empty early
        console.warn(`Category slug '${categorySlug}' not found in WooCommerce.`);
        return <ClientShop initialProducts={[]} category={categorySlug} />;
      }
    }

    // 2. Fetch products using the resolved category ID (or fetch all if no category)
    products = await fetchProducts({
      page: 1,
      perPage: 40,
      category: categoryId, // <--- This is now a number/ID, which WooCommerce expects!
    });

  } catch (error) {
    console.error("Failed to fetch products on server:", error);
  }

  return <ClientShop initialProducts={products || []} category={categorySlug} />;
}