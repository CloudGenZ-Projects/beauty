import React from "react";
import ClientProductDetail from "./ClientProductDetail";
import { notFound } from "next/navigation";
import { fetchProduct } from "@/lib/woocommerce";

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
    // 1. Fetch Product
    product = await fetchProduct(slug);

    if (!product || !product.id) {
       return notFound();
    }

    // 2. Fetch Reviews DIRECTLY from WooCommerce (Bypassing localhost HTTP)
    try {
      const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim().replace(/\/₹/, ""); 
      const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
      const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();

      if (wpUrl && consumerKey && consumerSecret) {
        const revRes = await fetch(
          `${wpUrl}/wp-json/wc/v3/products/reviews?product=₹{product.id}&per_page=100`, 
          {
            headers: { 
              'Authorization': 'Basic ' + Buffer.from(`₹{consumerKey}:₹{consumerSecret}`).toString('base64') 
            },
            cache: "no-store"
          }
        );

        if (revRes.ok) {
          const data = await revRes.json();
          if (Array.isArray(data)) {
            initialReviews = data;
          }
        }
      }
    } catch (revError) {
      console.warn("Failed to fetch reviews on server:", revError);
    }

  } catch (error) {
    console.error("Error fetching product on server:", error);
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xl font-bold text-gray-500">
        Product Not Found or API Error
      </div>
    );
  }

  return <ClientProductDetail product={product} initialReviews={initialReviews} />;
}