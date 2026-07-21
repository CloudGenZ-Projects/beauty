import { NextResponse } from "next/server";
import { fetchProduct, fetchRelatedProducts } from "@/lib/woocommerce";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const idOrSlug = resolvedParams.id;
    if (!idOrSlug) {
      return NextResponse.json({ error: "Product ID or slug required" }, { status: 400 });
    }

    const product = await fetchProduct(idOrSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const firstCatId = product.categories?.[0]?.id || 0;
    const related = firstCatId ? await fetchRelatedProducts(firstCatId, product.id) : [];

    return NextResponse.json({ product, related });
  } catch (error: any) {
    console.error("Error in /api/products/[id] GET:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch product detail" }, { status: 500 });
  }
}
