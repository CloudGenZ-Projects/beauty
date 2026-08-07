// app/wishlist/ClientWishlist.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, Trash2, ShoppingCart } from "lucide-react";

interface ClientWishlistProps {
  initialWishlist: any[];
}

export default function ClientWishlist({ initialWishlist }: ClientWishlistProps) {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Client par load hone ke baad isMounted true hoga
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration Fix: Pehli baar SSR data dikhao, baad mein Context data
  const displayWishlist = isMounted ? wishlist : initialWishlist;

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <Heart className="w-12 h-12 text-[#d81b60] mx-auto mb-4 fill-current" />
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-gray-900">
            My Wishlist
          </h1>
          <p className="text-gray-500 mt-2">({displayWishlist.length} items saved)</p>
        </div>

        {displayWishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 mb-6">You haven't saved any items yet.</p>
            <Link href="/shop" className="bg-black text-white px-8 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#d81b60]">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {displayWishlist.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col group hover:shadow-xl transition-shadow relative">
                <button 
                  onClick={() => removeFromWishlist(item.id)} 
                  className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link href={`/shop/${item.slug}`} className="h-40 md:h-48 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </Link>
                <Link href={`/shop/${item.slug}`} className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#d81b60] transition-colors flex-1">
                  {item.name}
                </Link>
                <div className="font-black text-[#8e24aa] mb-4">
                  ₹{Number(item.price).toLocaleString()}
                </div>
                <button 
                  onClick={() => addItem({ ...item, quantity: 1 })} 
                  className="w-full bg-black text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d81b60] transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" /> Move to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}