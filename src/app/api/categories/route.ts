import { NextResponse } from "next/server";
import { fetchCategories } from "@/lib/woocommerce";

// YEH LINE ADD KI HAI - Isse Next.js purana data cache nahi karega aur hamesha live data layega!
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error in /api/categories GET:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}