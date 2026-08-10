"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  Sparkles,
  Clock,
  Copy,
  Check,
  ShoppingBag,
  Heart,
  Loader2,
  Tag,
  Flame,
  Percent,
  AlertCircle,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  on_sale: boolean;
  images: { src: string }[];
  categories?: { name: string }[];
}

interface DynamicCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: string;
  description: string;
  minimum_amount: string;
  date_expires: string | null;
}

export default function DynamicOffersPage() {
  // Safe Cart & Wishlist Context Bridge to resolve TypeScript property mismatch
  const cartContext = useCart() as any;
  const wishlistContext = useWishlist() as any;

  const wishlist = wishlistContext?.wishlist || wishlistContext?.items || [];
  const addToWishlist = wishlistContext?.addToWishlist || wishlistContext?.addWishlist;
  const removeFromWishlist = wishlistContext?.removeFromWishlist || wishlistContext?.removeWishlist;

  const [coupons, setCoupons] = useState<DynamicCoupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "50-plus" | "30-plus" | "under-999"
  >("all");
  const [addedItems, setAddedItems] = useState<{ [key: number]: boolean }>({});

  // Dynamic Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // 1. Fetch Dynamic Offers Data
  useEffect(() => {
    async function fetchOffersData() {
      setLoading(true);
      try {
        const res = await fetch("/api/offers");
        if (res.ok) {
          const data = await res.json();
          setCoupons(data.coupons || []);
          setProducts(data.products || []);

          setupDynamicTimer(data.coupons || []);
        }
      } catch (err) {
        console.error("Error loading offers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOffersData();
  }, []);

  // Compute Timer dynamically from WooCommerce Coupon Expiration or End of Day
  const setupDynamicTimer = (couponList: DynamicCoupon[]) => {
    let targetTime = new Date().setHours(23, 59, 59, 999);

    const expiringCoupon = couponList.find((c) => c.date_expires !== null);
    if (expiringCoupon && expiringCoupon.date_expires) {
      targetTime = new Date(expiringCoupon.date_expires).getTime();
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff > 0) {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  };

  // Copy Coupon Action
  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Wishlist Check
  const isInWishlist = (productId: number) => {
    return wishlist.some((item: any) => item.id === productId);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      if (typeof removeFromWishlist === "function") {
        removeFromWishlist(product.id);
      }
    } else {
      if (typeof addToWishlist === "function") {
        addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0]?.src || "/placeholder.png",
          slug: product.slug,
        });
      }
    }
  };

  // Add To Cart Action (Supports addToCart, addItem, or addItemToCart dynamically)
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const addToCartFn =
      cartContext?.addToCart || cartContext?.addItem || cartContext?.addItemToCart;

    if (typeof addToCartFn === "function") {
      addToCartFn(
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.images[0]?.src || "/placeholder.png",
          quantity: 1,
        },
        1
      );
    }

    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  // Dynamic Discount Tier Filter
  const filteredProducts = products.filter((p) => {
    const regPrice = Number(p.regular_price);
    const salePrice = Number(p.price);
    const discount =
      regPrice > salePrice ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 0;

    if (selectedFilter === "50-plus") return discount >= 50;
    if (selectedFilter === "30-plus") return discount >= 30;
    if (selectedFilter === "under-999") return salePrice <= 999;
    return true;
  });

  return (
    <div className="bg-gray-50/60 min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* HERO BANNER & DYNAMIC COUNTDOWN TIMER */}
        <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-[#4a0823] text-white rounded-3xl p-6 sm:p-12 mb-10 shadow-2xl relative overflow-hidden border border-gray-800">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d81b60]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <Flame className="w-4 h-4 text-pink-500 animate-pulse" /> Live Store Offers
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-none mb-4">
                Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300">Beauty Deals</span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-xl">
                Unbeatable discounts on bestselling skincare, makeup essentials & luxury fragrances straight from our WooCommerce catalog.
              </p>
            </div>

            {/* Dynamic Countdown Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 text-center shadow-xl min-w-[280px]">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-pink-300 uppercase tracking-widest mb-3">
                <Clock className="w-4 h-4" /> Deals Expire In
              </div>

              <div className="flex items-center justify-center gap-3 text-gray-900">
                <div className="bg-white rounded-xl py-2 px-3.5 shadow-md flex flex-col items-center min-w-[54px]">
                  <span className="text-xl sm:text-2xl font-black">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Hours</span>
                </div>
                <span className="text-2xl font-black text-white">:</span>
                <div className="bg-white rounded-xl py-2 px-3.5 shadow-md flex flex-col items-center min-w-[54px]">
                  <span className="text-xl sm:text-2xl font-black">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Mins</span>
                </div>
                <span className="text-2xl font-black text-white">:</span>
                <div className="bg-white rounded-xl py-2 px-3.5 shadow-md flex flex-col items-center min-w-[54px]">
                  <span className="text-xl sm:text-2xl font-black text-[#d81b60]">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC WOOCOMMERCE COUPONS SECTION */}
        {coupons.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-[#d81b60]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-gray-900">
                Active Promo Coupons ({coupons.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coupons.map((coupon) => {
                const isPercent = coupon.discount_type === "percent";
                const discountTitle = isPercent
                  ? `${coupon.amount}% OFF`
                  : `FLAT $${coupon.amount} OFF`;

                return (
                  <div
                    key={coupon.id}
                    className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between border border-gray-700"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 block mb-1">
                        {Number(coupon.minimum_amount) > 0
                          ? `Min. spend $${Number(coupon.minimum_amount).toLocaleString()}`
                          : "No Minimum Spend Required"}
                      </span>
                      <h3 className="text-xl font-black tracking-tight mb-2">
                        {discountTitle}
                      </h3>
                      <p className="text-xs text-gray-300 font-medium mb-6 line-clamp-2">
                        {coupon.description || `Apply promo code ${coupon.code} at checkout to claim your discount.`}
                      </p>
                    </div>

                    {/* Copy Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between border border-dashed border-white/20">
                      <span className="text-sm font-black tracking-widest uppercase font-mono text-pink-300">
                        {coupon.code}
                      </span>

                      <button
                        onClick={() => copyCouponCode(coupon.code)}
                        className="bg-white text-gray-900 hover:bg-pink-50 hover:text-[#d81b60] text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DISCOUNT TIER FILTER STRIP */}
        <div className="bg-white rounded-2xl p-4 mb-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#d81b60]" />
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Filter Steal Deals:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedFilter === "all"
                  ? "bg-[#d81b60] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Deals ({products.length})
            </button>
            <button
              onClick={() => setSelectedFilter("50-plus")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedFilter === "50-plus"
                  ? "bg-[#d81b60] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              50% OFF & Above
            </button>
            <button
              onClick={() => setSelectedFilter("30-plus")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedFilter === "30-plus"
                  ? "bg-[#d81b60] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              30% OFF & Above
            </button>
            <button
              onClick={() => setSelectedFilter("under-999")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedFilter === "under-999"
                  ? "bg-[#d81b60] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Under $999
            </button>
          </div>
        </div>

        {/* DYNAMIC PRODUCTS CATALOG GRID */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#d81b60] animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Fetching Live WooCommerce Deals...
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const regPrice = Number(product.regular_price);
              const salePrice = Number(product.price);
              const discount =
                regPrice > salePrice
                  ? Math.round(((regPrice - salePrice) / regPrice) * 100)
                  : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 hover:border-pink-200 transition-all hover:shadow-xl flex flex-col relative"
                >
                  {/* Dynamic Discount Badge */}
                  <div className="absolute top-5 left-5 z-10 flex flex-col gap-1">
                    {discount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart Toggle */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 text-gray-400 hover:text-[#d81b60] transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isInWishlist(product.id) ? "fill-[#d81b60] text-[#d81b60]" : ""
                      }`}
                    />
                  </button>

                  {/* Product Image Link */}
                  <Link href={`/shop/${product.slug}`} className="block mb-3">
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden p-3 flex items-center justify-center relative">
                      <img
                        src={product.images[0]?.src || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 line-clamp-1">
                      {product.categories?.[0]?.name || "On Sale"}
                    </span>

                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#d81b60] transition-colors mb-2 min-h-[36px]">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price & Savings */}
                    <div className="flex items-center gap-2 mt-auto mb-3">
                      <span className="text-sm sm:text-base font-black text-gray-900">
                        ${salePrice.toLocaleString()}
                      </span>
                      {regPrice > salePrice && (
                        <span className="text-xs text-gray-400 line-through font-semibold">
                          ${regPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Add To Cart Action */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                        addedItems[product.id]
                          ? "bg-green-600 text-white"
                          : "bg-gray-900 hover:bg-[#d81b60] text-white"
                      }`}
                    >
                      {addedItems[product.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> Claim Offer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700 mb-1">
              No active sale deals under this filter
            </p>
            <button
              onClick={() => setSelectedFilter("all")}
              className="text-xs font-bold text-[#d81b60] hover:underline uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}