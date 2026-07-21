import { NextResponse } from "next/server";
import { fetchProducts, searchProducts } from "@/lib/woocommerce";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("per_page") || 16);
    const orderby = searchParams.get("orderby") || "date";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    if (search) {
      const results = await searchProducts(search);
      return NextResponse.json(results);
    }

    const products = await fetchProducts({
      page,
      perPage,
      category,
      orderby,
      order,
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error in /api/products GET:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}
