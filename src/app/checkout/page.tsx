"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Loader2, Truck, ShieldCheck, CreditCard } from "lucide-react";

interface ShippingMethod {
  id: string;
  instance_id: number;
  title: string;
  cost: number;
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // Address Form
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    city: "",
    state: "",
    postcode: "",
    country: "US", // Default country
  });

  // Dynamic Shipping State
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const subtotal = totalPrice;
  const shippingCost = selectedMethod ? selectedMethod.cost : 0;
  const grandTotal = subtotal + shippingCost;

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

  // Fetch Dynamic Shipping Methods from WooCommerce API
  const fetchShippingMethods = async () => {
    setLoadingShipping(true);
    try {
      const res = await fetch("/api/shipping-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: form.country,
          state: form.state,
          postcode: form.postcode,
          items,
        }),
      });

      const data = await res.json();
      if (data.shipping_methods && data.shipping_methods.length > 0) {
        setShippingMethods(data.shipping_methods);
        setSelectedMethod(data.shipping_methods[0]); // Default to first WooCommerce method
      }
    } catch (err) {
      console.error("Failed to fetch shipping methods:", err);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Trigger dynamic shipping update when address changes
  useEffect(() => {
    if (form.postcode && form.country) {
      const timer = setTimeout(() => {
        fetchShippingMethods();
      }, 600); // Debounce typing
      return () => clearTimeout(timer);
    } else {
      fetchShippingMethods();
    }
  }, [form.country, form.state, form.postcode, items]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      alert("Please select a shipping method.");
      return;
    }

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
          payment_method: "stripe",
          customer_id: userId || 0,
          shipping_cost: selectedMethod.cost,
          shipping_method_title: selectedMethod.title,
          shipping_method_id: selectedMethod.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        throw new Error("Stripe checkout URL not returned.");
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
        <div className="flex-[3] p-8 md:p-10 space-y-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-4">
              1. Shipping Address
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
                  placeholder="State (e.g. CA)"
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

              <div>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d81b60] outline-none text-gray-700"
                >
                  <option value="US">United States (US)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="GB">United Kingdom (UK)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="IN">India (IN)</option>
                </select>
              </div>
            </form>
          </div>

          {/* Dynamic Shipping Options list from WooCommerce */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h2 className="text-xl font-black uppercase tracking-widest text-gray-900">
                2. Shipping Method
              </h2>
              {loadingShipping && <Loader2 className="w-4 h-4 animate-spin text-[#d81b60]" />}
            </div>

            <div className="space-y-3">
              {shippingMethods.length === 0 && !loadingShipping && (
                <p className="text-xs text-gray-500">Enter ZIP Code & State to view accurate shipping rates.</p>
              )}

              {shippingMethods.map((method) => (
                <label
                  key={method.id + method.instance_id}
                  onClick={() => setSelectedMethod(method)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMethod?.id === method.id
                      ? "border-[#d81b60] bg-pink-50/20 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping_option"
                      checked={selectedMethod?.id === method.id}
                      onChange={() => setSelectedMethod(method)}
                      className="accent-[#d81b60] w-4 h-4"
                    />
                    <p className="text-sm font-bold text-gray-900">{method.title}</p>
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    {method.cost === 0 ? (
                      <span className="text-emerald-600 uppercase">FREE</span>
                    ) : (
                      `₹${method.cost.toFixed(2)}`
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Powered by Stripe</span>
            </div>
          </div>
        </div>

        {/* Right Order Summary */}
        <div className="flex-[2] bg-gray-50 p-8 md:p-10 border-l border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-6 border-b border-gray-200 pb-4">
              Order Summary
            </h3>

            {/* Products */}
            <div className="overflow-y-auto space-y-4 mb-6 max-h-[240px] pr-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded object-contain bg-gray-50"
                    />
                    <div className="text-xs font-bold text-gray-700">
                      <p className="line-clamp-1">{item.name}</p>
                      <p className="text-gray-400 mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-[#d81b60]">
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Truck className="w-4 h-4 text-gray-400" /> Shipping
                </span>
                <span className="font-bold text-gray-900">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 uppercase font-black">Free</span>
                  ) : (
                    `₹${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between font-black text-2xl text-gray-900">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="w-full mt-8 bg-[#d81b60] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_4px_14px_0_rgba(216,27,96,0.39)] hover:shadow-[0_6px_20px_rgba(216,27,96,0.23)] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Pay ₹${grandTotal.toFixed(2)} with Stripe`
            )}
          </button>
        </div>

      </div>
    </div>
  );
}