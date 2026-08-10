"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
  });

  // Check login session & cart
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    const match = document.cookie.match(new RegExp("(^| )user_session=([^;]+)"));
    if (match) {
      try {
        const user = JSON.parse(decodeURIComponent(match[2]));
        if (user && user.id) {
          setUserId(user.id);
          setForm((prev) => ({
            ...prev,
            email: user.email || "",
            first_name: user.firstName || "",
            last_name: user.lastName || "",
          }));
          setIsVerifying(false);
        } else {
          router.push("/auth?redirect=/checkout");
        }
      } catch (e) {
        router.push("/auth?redirect=/checkout");
      }
    } else {
      router.push("/auth?redirect=/checkout");
    }
  }, [items, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const addressPayload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address_1: form.address_1,
        city: form.city,
        state: form.state,
        postcode: form.postcode,
        country: form.country,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          billing: addressPayload,
          shipping: addressPayload,
          payment_method: "stripe", // Force Stripe Payment
          customer_id: userId || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      // Redirect directly to Stripe Payment Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout URL not returned from server.");
      }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      alert(error.message || "Failed to initiate checkout. Please try again.");
      setLoading(false);
    }
  };

  if (isVerifying || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Left Form */}
        <div className="flex-[3] p-8 md:p-10">
          <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-4">
            Shipping Details
          </h2>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                name="first_name"
                value={form.first_name}
                placeholder="First Name"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
              />
              <input
                required
                name="last_name"
                value={form.last_name}
                placeholder="Last Name"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                type="email"
                name="email"
                value={form.email}
                placeholder="Email Address"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
              />
              <input
                required
                type="tel"
                name="phone"
                value={form.phone}
                placeholder="Phone Number"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
              />
            </div>
            <input
              required
              name="address_1"
              value={form.address_1}
              placeholder="Street Address"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                required
                name="city"
                value={form.city}
                placeholder="City"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
              />
              <input
                required
                name="state"
                value={form.state}
                placeholder="State"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
              />
              <input
                required
                name="postcode"
                value={form.postcode}
                placeholder="ZIP Code"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none"
              />
            </div>
          </form>
        </div>

        {/* Right Summary */}
        <div className="flex-[2] bg-gray-50 p-8 md:p-10 border-l border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-6 border-b border-gray-200 pb-4">
            Order Summary
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 max-h-[300px] pr-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded object-contain"
                  />
                  <div className="text-xs font-bold text-gray-700">
                    <p className="line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-[#d81b60]">
                  ${(Number(item.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex justify-between font-black text-2xl text-gray-900">
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="w-full bg-[#d81b60] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_4px_14px_0_rgba(216,27,96,0.39)] hover:shadow-[0_6px_20px_rgba(216,27,96,0.23)] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Pay Securely with Stripe"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}