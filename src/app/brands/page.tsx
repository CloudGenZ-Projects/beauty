"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Sparkles, ArrowRight, Tag } from "lucide-react";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export default function AllBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch("/api/megamenu");
        if (res.ok) {
          const data = await res.json();
          const popular = data.brands?.popular || [];
          const luxe = data.brands?.luxe || [];

          // Format & Deduplicate Brands
          const allRaw = [...popular, ...luxe];
          const formatted: Brand[] = allRaw.map((b: any, index: number) => ({
            id: b.id || index,
            name: typeof b === "string" ? b : b.name || "Brand",
            slug:
              typeof b === "string"
                ? b.toLowerCase().trim().replace(/\s+/g, "-")
                : b.slug,
            logo: typeof b === "object" ? b.logo : "",
          }));

          setBrands(formatted);
        }
      } catch (err) {
        console.error("Error loading brands page:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  // Filter brands by live search
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-[#d81b60] text-xs font-bold px-3 py-1.5 rounded-full mb-3 uppercase tracking-wider border border-pink-100">
            <Sparkles className="w-3.5 h-3.5" /> Luxury & Beauty Atelier
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase mb-3">
            Our World of Brands
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Discover authentic products from the most prestigious global beauty brands.
          </p>

          {/* Live Search Bar for Brands */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your favorite brand..."
              className="w-full bg-white border border-gray-200 focus:border-[#d81b60] rounded-full py-3 pl-11 pr-4 text-xs sm:text-sm font-medium text-gray-900 shadow-sm outline-none transition-all focus:shadow-[0_0_0_4px_rgba(216,27,96,0.1)]"
            />
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#d81b60] animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Loading Brands Catalog...
            </p>
          </div>
        ) : filteredBrands.length > 0 ? (
          /* Brands Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {filteredBrands.map((brand, idx) => (
              <Link
                key={`${brand.slug}-${idx}`}
                href={`/brands/${brand.slug}`}
                className="bg-white border border-gray-100 hover:border-pink-300 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center shadow-sm hover:shadow-xl transition-all h-44 group relative overflow-hidden"
              >
                {/* 1. Brand Logo Container */}
                <div className="w-full h-16 flex items-center justify-center p-1">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-12 max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-[#d81b60] font-black text-sm">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* 2. Brand Name (ALWAYS VISIBLE) */}
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#d81b60] transition-colors line-clamp-1 mt-1">
                  {brand.name}
                </h3>

                {/* 3. Explore Link */}
                <span className="text-[10px] font-bold text-[#d81b60] opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 uppercase tracking-wider mt-1">
                  Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
            <p className="text-sm font-bold text-gray-700 mb-1">
              No brands matched "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-[#d81b60] hover:underline uppercase tracking-wider"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}