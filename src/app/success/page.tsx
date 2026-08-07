"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CheckCircle, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const order_id = searchParams.get("order_id");
  
  const { clearCart } = useCart(); // Defined in context, or fallback to cookies
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!session_id || !order_id) {
        setStatus("failed");
        return;
      }

      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, order_id }),
        });
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          // Empty the cart
          if (clearCart) clearCart();
          else document.cookie = "loiseau_cart=; path=/; max-age=0;";
        } else {
          setStatus("failed");
        }
      } catch (error) {
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [session_id, order_id, clearCart]);

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f9fafb]">
        <Loader2 className="w-10 h-10 animate-spin text-[#d81b60] mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest">Verifying your payment...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f9fafb]">
        <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4">Verification Failed</h1>
        <p className="text-gray-500 mb-6">We couldn't verify your payment. Please check your orders or contact support.</p>
        <Link href="/account" className="px-8 py-3 bg-black text-white font-bold uppercase text-xs rounded-lg hover:bg-gray-800">
          Go to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f9fafb] px-4">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-widest text-center mb-4">Payment Successful!</h1>
      <p className="text-gray-500 text-center max-w-md mb-2">Your order has been placed and is currently being processed. You will receive an email confirmation shortly.</p>
      
      {order_id && (
        <div className="bg-white px-6 py-3 rounded-lg border border-gray-200 mt-4 mb-8 shadow-sm">
          <p className="font-bold text-gray-900">Order ID: <span className="text-[#d81b60]">#{order_id}</span></p>
        </div>
      )}
      
      <div className="flex gap-4">
        <Link href="/account" className="px-8 py-4 bg-black text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
          View Orders
        </Link>
        <Link href="/shop" className="px-8 py-4 bg-white border border-gray-200 text-gray-800 font-bold uppercase text-xs tracking-widest rounded-xl hover:border-[#d81b60] hover:text-[#d81b60] transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#d81b60]"/></div>}>
      <SuccessContent />
    </Suspense>
  );
}