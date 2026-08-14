"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist, WishlistItem } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Trash2, ArrowRight, UserCheck, Lock } from "lucide-react";

interface ClientWishlistProps {
  initialWishlist: WishlistItem[];
  initialIsLoggedIn?: boolean;
}

export default function ClientWishlist({
  initialWishlist,
  initialIsLoggedIn = false,
}: ClientWishlistProps) {
  const { wishlist, removeFromWishlist, clearWishlist, isLoggedIn } = useWishlist();
  const { addItem } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayWishlist = isMounted ? wishlist : initialWishlist;
  const userLoggedIn = isMounted ? isLoggedIn : initialIsLoggedIn;

  if (displayWishlist.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#fafafa] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#d81b60]">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-widest mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
            Explore our luxury beauty collections and save your favorite items for later.
          </p>

          <Link
            href="/shop"
            className="w-full bg-gray-900 hover:bg-[#d81b60] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-pink-200 flex items-center justify-center gap-2 group"
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* LOGGED IN / GUEST NOTIFICATION BANNER */}
        {!userLoggedIn && (
          <div className="mb-6 bg-pink-50/80 border border-pink-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium text-gray-800">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <Lock className="w-4 h-4 text-[#d81b60] flex-shrink-0" />
              <span>
                You are currently browsing as a guest. <strong>Log in</strong> to sync your wishlist permanently across all your devices.
              </span>
            </div>
            <Link
              href="/account"
              className="bg-gray-900 hover:bg-[#d81b60] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex-shrink-0"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-3">
              My Wishlist <span className="text-[#d81b60]">({displayWishlist.length})</span>
              {userLoggedIn && (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Account Synced
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Your saved luxury beauty picks
            </p>
          </div>

          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider underline"
          >
            Clear All
          </button>
        </div>

        {/* WISHLIST PRODUCT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayWishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex flex-col group hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              {/* Remove Button */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 bg-white/80 backdrop-blur p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 z-20 transition-all shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Product Thumbnail */}
              <Link
                href={`/shop/₹{item.slug}`}
                className="h-44 sm:h-52 w-full flex items-center justify-center bg-gray-50/50 rounded-xl mb-3 overflow-hidden relative"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Product Info */}
              <div className="flex flex-col flex-1 text-center">
                <Link
                  href={`/shop/₹{item.slug}`}
                  className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 hover:text-[#d81b60] transition-colors mb-2 leading-relaxed"
                >
                  {item.name}
                </Link>

                <div className="mt-auto pt-2">
                  <div className="text-sm sm:text-base font-black text-gray-900 mb-3">
                    ₹{Number(item.price).toLocaleString()}
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: Number(item.id),
                        name: item.name,
                        slug: item.slug,
                        price: item.price,
                        quantity: 1,
                        image: item.image,
                      });
                    }}
                    className="w-full py-2.5 bg-gray-900 hover:bg-[#d81b60] text-white text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Move To Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}