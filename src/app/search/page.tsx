"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { getProductImage } from "@/app/page";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-gray-900">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-500 mt-2 font-medium">{results.length} products found</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#d81b60]" /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">No results found</h2>
            <p className="text-gray-500 mt-2">Try checking your spelling or using different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((prod) => (
              <Link key={prod.id} href={`/shop/${prod.slug || prod.id}`} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col group hover:shadow-xl transition-shadow">
                <div className="h-40 md:h-48 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
                  <img src={getProductImage(prod)} alt={prod.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#d81b60]">{prod.name}</h3>
                <div className="font-black text-gray-900 mt-auto">₹{Number(prod.price || 0).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div>Loading...</div>}><SearchResults /></Suspense>;
}