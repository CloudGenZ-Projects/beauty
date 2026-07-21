import { NextResponse } from "next/server";
import { fetchCategories } from "@/lib/woocommerce";

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error in /api/categories GET:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}
