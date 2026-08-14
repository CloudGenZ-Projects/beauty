"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useCart, CartItem } from "@/context/CartContext";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  RotateCcw,
  Lock,
  MessageSquare,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function ClientCart({ initialCart }: { initialCart: CartItem[] }) {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Cart Customization States
  const [couponCode, setCouponCode] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    rawValue: number;
    discountType: "percent" | "fixed";
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration sync between Server Cookie & Client Context
  const displayItems = isMounted ? items : initialCart;
  const displayTotalItems = isMounted
    ? totalItems
    : initialCart.reduce((acc, item) => acc + item.quantity, 0);
  const rawTotalPrice = isMounted
    ? totalPrice
    : initialCart.reduce((acc, item) => acc + parseFloat(item.price || "0") * item.quantity, 0);

  // Calculate Real-time Discount based on Applied Coupon
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percent") {
      return (rawTotalPrice * appliedCoupon.rawValue) / 100;
    }
    return Math.min(appliedCoupon.rawValue, rawTotalPrice);
  }, [appliedCoupon, rawTotalPrice]);

  const finalTotal = Math.max(0, rawTotalPrice - discountAmount);

  // REAL WOOCOMMERCE API CALL FOR COUPON VALIDATION
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const codeToTest = couponCode.trim();
    if (!codeToTest) return;

    setIsCouponLoading(true);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToTest,
          subtotal: rawTotalPrice,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAppliedCoupon({
          code: data.code,
          rawValue: data.rawValue,
          discountType: data.discountType,
        });
        setCouponSuccess(data.message || "Coupon applied!");
        setCouponCode("");
      } else {
        setCouponError(data.message || "Invalid coupon code.");
      }
    } catch (err) {
      console.error("Coupon application error:", err);
      setCouponError("Failed to connect to coupon server.");
    } finally {
      setIsCouponLoading(false);
    }
  };

  // -------------------------------------------------------------
  // EMPTY CART STATE
  // -------------------------------------------------------------
  if (displayItems.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#fafafa] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#d81b60]">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-widest mb-2">
            Your Bag is Empty
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
            Looks like you haven't added any luxury beauty essentials to your bag yet.
          </p>

          <Link
            href="/shop"
            className="w-full bg-gray-900 hover:bg-[#d81b60] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-pink-200 flex items-center justify-center gap-2 group"
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Quick Category Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
              Popular Categories
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {["Skincare", "Makeup", "Hair", "Fragrance"].map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=₹{cat.toLowerCase()}`}
                  className="bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-[#d81b60] text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-100 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL CART UI
  // -------------------------------------------------------------
  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 pb-32 lg:pb-16">
      <div className="max-w-[1300px] mx-auto">
        
        {/* PAGE HEADER */}
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-5 mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-gray-900">
            Shopping Bag <span className="text-[#d81b60]">({displayTotalItems})</span>
          </h1>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-gray-500 hover:text-[#d81b60] flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            <span className="hidden sm:inline">Continue Shopping</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
          
          {/* LEFT COLUMN: ITEM LIST & ORDER NOTE */}
          <div className="flex-1 w-full space-y-6">
            
            {/* CART ITEMS LIST */}
            <div className="space-y-4">
              {displayItems.map((item) => {
                const itemTotal = parseFloat(item.price || "0") * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center relative group"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/shop/₹{item.slug}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl border border-gray-100 p-2 flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:border-pink-200 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/shop/₹{item.slug}`}
                          className="font-bold text-sm sm:text-base text-gray-900 hover:text-[#d81b60] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>

                        {/* Mobile Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 p-1 sm:hidden transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="font-black text-sm sm:text-base text-gray-900">
                          ₹{Number(item.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          In Stock
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Total Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 sm:p-1.5 hover:bg-white text-gray-600 hover:text-[#d81b60] rounded-lg transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-black text-xs sm:text-sm text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 sm:p-1.5 hover:bg-white text-gray-600 hover:text-[#d81b60] rounded-lg transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase sm:hidden">Total</span>
                        <span className="font-black text-sm sm:text-base text-gray-900">
                          ₹{itemTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Desktop Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl hidden sm:block transition-all"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER INSTRUCTION NOTE */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900">
                  <MessageSquare className="w-4 h-4 text-[#d81b60]" />
                  Order Instructions & Notes
                </div>
                <button
                  onClick={() => setShowOrderNote(!showOrderNote)}
                  className="text-xs font-bold text-[#d81b60] hover:underline"
                >
                  {showOrderNote ? "Close" : orderNote ? "Edit Note" : "+ Add Note"}
                </button>
              </div>

              {showOrderNote && (
                <div className="mt-3 animate-in fade-in duration-200">
                  <textarea
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Add special instructions for delivery, landmark, or gift messages..."
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d81b60] focus:bg-white transition-all resize-none font-medium"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setShowOrderNote(false)}
                      className="bg-gray-900 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider hover:bg-[#d81b60] transition-colors"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY CARD */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl lg:sticky lg:top-24 space-y-6">
              
              <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-4">
                Order Summary
              </h2>

              {/* REAL WOOCOMMERCE COUPON FORM */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Have a Promo Code?
                </label>

                {appliedCoupon ? (
                  <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#d81b60]" />
                      <div>
                        <span className="font-black text-xs text-[#d81b60] uppercase tracking-wider block">
                          {appliedCoupon.code} Applied
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">
                          {appliedCoupon.discountType === "percent"
                            ? `₹{appliedCoupon.rawValue}% discount applied`
                            : `₹₹{appliedCoupon.rawValue} off applied`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponSuccess("");
                      }}
                      className="p-1 hover:bg-pink-100 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter WooCommerce Promo"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isCouponLoading}
                      className="flex-1 bg-gray-50 border border-gray-200 text-xs font-bold uppercase px-3.5 py-3 rounded-xl outline-none focus:border-[#d81b60] focus:bg-white transition-all placeholder:normal-case placeholder:font-normal"
                    />
                    <button
                      type="submit"
                      disabled={isCouponLoading}
                      className="bg-gray-900 hover:bg-[#d81b60] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                    >
                      {isCouponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1.5 pl-1">
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-emerald-600 text-[11px] font-bold mt-1.5 pl-1">
                    {couponSuccess}
                  </p>
                )}
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="space-y-3.5 text-xs font-semibold text-gray-600 border-t border-b border-gray-100 py-4">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-gray-900">₹{rawTotalPrice.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#d81b60]">
                    <span>Promo Discount</span>
                    <span className="font-black">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase text-[11px]">Calculated at Checkout</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Taxes</span>
                  <span className="font-bold text-gray-900">Included</span>
                </div>
              </div>

              {/* TOTAL AMOUNT */}
              <div className="flex justify-between items-end pt-1">
                <div>
                  <span className="text-xs font-bold uppercase text-gray-400 block tracking-wider">Total</span>
                  <span className="text-[10px] text-gray-400">Final price on checkout</span>
                </div>
                <span className="text-3xl font-black text-[#d81b60]">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>

              {/* CHECKOUT BUTTON */}
              <Link
                href="/checkout"
                className="w-full bg-gray-900 hover:bg-[#d81b60] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-pink-200 transition-all group"
              >
                <Lock className="w-4 h-4" />
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* TRUST BADGES */}
              <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-[#d81b60]" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                  <Lock className="w-4 h-4 text-[#d81b60]" />
                  <span>Secure Pay</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                  <RotateCcw className="w-4 h-4 text-[#d81b60]" />
                  <span>Easy Returns</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOTTOM CHECKOUT BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total</span>
            <span className="text-xl font-black text-[#d81b60]">₹{finalTotal.toLocaleString()}</span>
          </div>

          <Link
            href="/checkout"
            className="flex-1 bg-gray-900 hover:bg-[#d81b60] text-white py-3.5 px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}