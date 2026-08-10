"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CheckCircle2, ShoppingBag, ArrowRight, PackageCheck, Home, Loader2 } from "lucide-react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const cartContext = useCart() as any;

  // Clear Cart items after successful order creation
  useEffect(() => {
    const clearCartFn =
      cartContext?.clearCart || cartContext?.clear || cartContext?.emptyCart;
    if (typeof clearCartFn === "function") {
      clearCartFn();
    }
  }, []);

  return (
    <div className="min-h-[80vh] bg-gray-50/50 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl text-center relative overflow-hidden">
        
        {/* Top Pink Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-[#d81b60] via-purple-500 to-pink-500 rounded-b-full" />

        {/* Success Icon */}
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-[#d81b60] mx-auto mb-6 shadow-inner border border-pink-100">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider border border-green-100">
          <PackageCheck className="w-3.5 h-3.5 text-green-600" /> Order Placed Successfully
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase mb-2">
          Thank You For Your Order!
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 font-medium mb-6">
          Your order has been confirmed and is being processed by our luxury atelier team.
        </p>

        {/* Order ID Box */}
        {orderId && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-8 inline-flex flex-col items-center justify-center min-w-[200px]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Order Number
            </span>
            <span className="text-xl font-black text-[#d81b60] font-mono">
              #{orderId}
            </span>
          </div>
        )}

        {/* Process Steps */}
        <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-6 mb-8 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#d81b60] uppercase">Step 1</span>
            <span className="text-xs font-bold text-gray-800">Order Confirmed</span>
          </div>
          <div className="flex flex-col gap-1 border-x border-gray-100 px-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Step 2</span>
            <span className="text-xs font-bold text-gray-800">Quality Check</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Step 3</span>
            <span className="text-xs font-bold text-gray-800">Express Delivery</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/account"
            className="w-full sm:flex-1 py-3 px-4 bg-gray-900 hover:bg-[#d81b60] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" /> View My Orders
          </Link>
          <Link
            href="/shop"
            className="w-full sm:flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#d81b60]" /></div>}>
      <ThankYouContent />
    </Suspense>
  );
}