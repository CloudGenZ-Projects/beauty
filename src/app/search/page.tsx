import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getProductImage } from "@/app/page";

// Force dynamic so it always fetches fresh data based on the URL query
export const dynamic = "force-dynamic";

// Next.js 15 mein searchParams ek Promise hota hai, isliye async use karna padega
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // URL se query nikaliye (eg: ?q=shirt)
  const params = await searchParams;
  const query = (params?.q as string) || "";

  let results: any[] = [];

  // Agar query hai, toh server par hi API call kijiye
  if (query) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/products/search?q=${encodeURIComponent(query)}`, {
        cache: 'no-store' // Always fresh search
      });
      
      if (res.ok) {
        const data = await res.json();
        results = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error("Failed to fetch search results on server:", error);
    }
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-gray-900">
            {query ? `Search Results for "${query}"` : "Search Products"}
          </h1>
          {query && (
            <p className="text-gray-500 mt-2 font-medium">{results.length} products found</p>
          )}
        </div>

        {/* Condition 1: No query entered yet */}
        {!query ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Start Searching</h2>
            <p className="text-gray-500 mt-2">Enter a keyword to find products.</p>
          </div>
        ) 
        /* Condition 2: No results found for the query */
        : results.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">No results found</h2>
            <p className="text-gray-500 mt-2">Try checking your spelling or using different keywords.</p>
          </div>
        ) 
        /* Condition 3: Show Results */
        : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((prod) => (
              <Link 
                key={prod.id} 
                href={`/shop/${prod.slug || prod.id}`} 
                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col group hover:shadow-xl transition-shadow"
              >
                <div className="h-40 md:h-48 flex items-center justify-center bg-gray-50 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={getProductImage(prod)} 
                    alt={prod.name} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
                  />
                </div>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#d81b60]">
                  {prod.name}
                </h3>
                <div className="font-black text-gray-900 mt-auto">
                  ₹{Number(prod.price || 0).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}