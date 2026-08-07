// app/shop/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 min-h-screen">
      <div className="text-center pb-6">
        <div className="h-10 w-64 bg-gray-200 animate-pulse mx-auto rounded mb-2"></div>
        <div className="w-16 h-1 bg-[#d81b60] mx-auto rounded-full"></div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-gray-100 rounded-lg border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}