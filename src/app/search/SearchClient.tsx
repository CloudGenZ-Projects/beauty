"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Frown, ShoppingBag, ArrowRight } from "lucide-react";

// Helper function to safely extract the image URL
const getProductImage = (product: any) => {
  if (product?.images && product.images.length > 0) {
    return product.images[0].src;
  }
  return "/placeholder-image.png"; 
};

interface SearchClientProps {
  initialQuery: string;
  initialResults: any[];
}

export default function SearchClient({ initialQuery, initialResults }: SearchClientProps) {
  const [sortBy, setSortBy] = useState("relevance");

  // Sorting Logic
  const sortedResults = useMemo(() => {
    let sorted = [...initialResults];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
        break;
      default:
        // Relevance keeps the default API order
        break;
    }
    return sorted;
  }, [initialResults, sortBy]);

  return (
    <div className="bg-[#f9fafb] min-h-screen py-8 md:py-12 px-4 sm:px-6 relative">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-8 md:mb-12">
          {initialQuery ? (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                {/* Search Text now shows up exactly after the title */}
                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-gray-900 leading-tight">
                  Search Results for <span className="text-[#d81b60]">"{initialQuery}"</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 mt-2 font-medium">
                  Showing <span className="text-gray-900 font-bold">{sortedResults.length}</span> results found
                </p>
              </div>

              {/* SORT DROPDOWN (Only show if there are results) */}
              {sortedResults.length > 0 && (
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-5 h-5 text-gray-400 hidden sm:block" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] shadow-sm appearance-none cursor-pointer w-full md:w-auto"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="newest">Sort by: Newest Arrivals</option>
                    <option value="price-low">Sort by: Price (Low to High)</option>
                    <option value="price-high">Sort by: Price (High to Low)</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-gray-900">
                Search Products
              </h1>
            </div>
          )}
        </div>

        {/* CONDITION 1: No query entered yet */}
        {!initialQuery ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-[#d81b60]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">What are you looking for?</h2>
            <p className="text-gray-500 mt-3 max-w-md text-center">Use the search bar in the menu above to find your favorite beauty products, serums, perfumes, and more.</p>
          </div>
        ) : sortedResults.length === 0 ? (
          /* CONDITION 2: No results found for the query */
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-100 rounded-3xl shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Frown className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">No exact matches found</h2>
            <p className="text-gray-500 mt-3 max-w-md text-center mb-8">We couldn't find anything matching <span className="font-bold text-gray-700">"{initialQuery}"</span>. Try checking for typos or using broader keywords.</p>
            <Link href="/shop" className="bg-gray-900 text-white px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg">
              Explore All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* CONDITION 3: Show Results Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {sortedResults.map((prod) => {
              const isOnSale = prod.on_sale && prod.regular_price && prod.price < prod.regular_price;
              
              return (
                <Link 
                  key={prod.id} 
                  href={`/shop/${prod.slug || prod.id}`} 
                  className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 flex flex-col group hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  {/* Sale Badge */}
                  {isOnSale && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded z-10">
                      Sale
                    </span>
                  )}
                  
                  {/* Image Container */}
                  <div className="h-40 sm:h-52 w-full flex items-center justify-center bg-gray-50/50 rounded-xl mb-4 overflow-hidden relative">
                    <img 
                      src={getProductImage(prod)} 
                      alt={prod.name} 
                      loading="lazy"
                      className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                    />
                    
                    {/* Hover Overlay Button (Desktop) */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900 shadow-md flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" /> View
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#d81b60] transition-colors leading-relaxed">
                      {prod.name}
                    </h3>
                    
                    <div className="mt-auto flex items-center gap-2">
                      <span className="font-black text-gray-900 text-sm sm:text-base">
                        ${Number(prod.price || 0).toLocaleString()}
                      </span>
                      {isOnSale && (
                        <span className="text-xs text-gray-400 line-through font-semibold">
                          ${Number(prod.regular_price || 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}