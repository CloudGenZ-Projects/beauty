"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { getProductImage } from "@/app/page";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    const fetchUrl = initialCategory 
        ? `/api/products?per_page=40&category=${initialCategory}` 
        : `/api/products?per_page=40`;

    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [initialCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 min-h-screen">
      <div className="text-center pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 capitalize">
          {initialCategory ? decodeURIComponent(initialCategory).replace(/-/g, ' ') : "All Products"}
        </h1>
        <div className="w-16 h-1 bg-[#d81b60] mx-auto rounded-full"></div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 rounded-lg border border-gray-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">No products found in this category.</div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {products.map((prod) => {
                const imgUrl = getProductImage(prod);
                const currentPrice = prod.sale_price || prod.price || "0";
                const originalPrice = prod.regular_price || (Number(currentPrice) * 1.25).toFixed(2);
                
                const rawSlug = prod.slug || prod.id;
                const safeSlug = encodeURIComponent(String(rawSlug));

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`shop-item-${prod.id}`}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative p-3"
                  >
                    {/* Fixed: Link separated from Add to Cart button */}
                    <Link href={`/shop/${safeSlug}`} prefetch={false} className="block relative w-full aspect-square bg-white rounded-lg overflow-hidden mb-3">
                      <img src={imgUrl} alt={prod.name} className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500" />
                    </Link>

                    <div className="flex flex-col text-center flex-1">
                      <Link href={`/shop/${safeSlug}`} prefetch={false} className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 hover:text-[#d81b60] transition-colors mb-2 min-h-[32px] md:min-h-[40px]">
                        {prod.name}
                      </Link>
                      
                      <div className="mt-auto">
                         <div className="flex items-center justify-center gap-2 mb-3">
                            {originalPrice !== currentPrice && (
                                <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{Number(originalPrice).toLocaleString()}</span>
                            )}
                            <span className="text-sm md:text-base font-bold text-[#8e24aa]">₹{Number(currentPrice).toLocaleString()}</span>
                         </div>
                        
                         <button
                          onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addItem({ id: prod.id, name: prod.name, slug: rawSlug, price: currentPrice, quantity: 1, image: imgUrl });
                          }}
                          className="w-full py-2 bg-gray-900 text-white text-[10px] md:text-xs font-bold rounded flex justify-center items-center gap-2 hover:bg-[#d81b60] transition-colors uppercase tracking-wider shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add To Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-32 text-xl font-bold text-gray-400 animate-pulse">Loading Products...</div>}>
      <ShopContent />
    </Suspense>
  );
}