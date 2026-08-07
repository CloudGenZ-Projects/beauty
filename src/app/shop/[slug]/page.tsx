// src/app/shop/[slug]/page.tsx
import React from "react";
import ClientProductDetail from "./ClientProductDetail";
import { notFound } from "next/navigation";
import { fetchProduct } from "@/lib/woocommerce"; // <-- DIRECT WOOCOMMERCE IMPORT

export const dynamic = "force-dynamic";

export default async function ProductDetailPageSSR({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug;
  const slug = typeof rawSlug === 'string' ? decodeURIComponent(rawSlug) : "";

  if (!slug) return notFound();

  let product = null;
  let initialReviews: any[] = [];

  try {
    // 1. Fetch Product DIRECTLY from WooCommerce (Bypassing localhost API)
    product = await fetchProduct(slug);

    if (!product || !product.id) {
       return notFound();
    }

    // 2. Fetch Reviews 
    // (We wrap this in its own try/catch so if reviews fail, the product still loads!)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const revRes = await fetch(`${baseUrl}/api/reviews?product_id=${product.id}`, { cache: "no-store" });
      if (revRes.ok) {
        initialReviews = await revRes.json();
      }
    } catch (revError) {
      console.warn("Failed to fetch reviews on server. Will use empty array.", revError);
    }

  } catch (error) {
    console.error("Error fetching product on server:", error);
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xl font-bold text-gray-500">
        Product Not Found or API Error
      </div>
    );
  }

  // 3. Pass data to the interactive Client Component
  return <ClientProductDetail product={product} initialReviews={initialReviews} />;
}