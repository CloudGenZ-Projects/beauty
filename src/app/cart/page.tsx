"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, X as XIcon } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [coupon, setCoupon] = useState("");

  const shippingCost = items.length > 0 ? 100 : 0;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link href="/shop" className="inline-block px-8 py-3 bg-ss-gradient text-white rounded-md font-bold text-sm uppercase">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      
      {/* Top Progress Bar */}
      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide mb-10 border-b border-gray-200 pb-4">
        <span className="text-[#8e24aa] border-b-2 border-[#8e24aa] pb-1">SHOPPING CART</span>
        <span className="text-gray-400">→</span>
        <span className="text-gray-400">CHECKOUT</span>
        <span className="text-gray-400">→</span>
        <span className="text-gray-400">ORDER COMPLETE</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left: Cart Items Table */}
        <div className="lg:w-2/3">
           {/* Desktop Table Header */}
           <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs font-bold text-gray-800 uppercase tracking-wide">
             <div className="col-span-6">PRODUCT</div>
             <div className="col-span-2 text-center">PRICE</div>
             <div className="col-span-2 text-center">QUANTITY</div>
             <div className="col-span-2 text-right">SUBTOTAL</div>
           </div>

           {/* Items */}
           <div className="divide-y divide-gray-100">
             {items.map((item) => (
               <div key={item.id} className="py-6 flex flex-col sm:grid sm:grid-cols-12 items-center gap-4">
                 
                 {/* Product Col */}
                 <div className="col-span-6 flex items-center gap-4 w-full">
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                      <XIcon className="w-5 h-5" />
                    </button>
                    <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded p-1 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <Link href={`/shop/${item.slug}`} className="text-sm font-semibold text-gray-800 hover:text-[#d81b60]">{item.name}</Link>
                 </div>

                 {/* Price Col */}
                 <div className="col-span-2 text-center text-sm font-bold text-[#20409a] w-full sm:w-auto">
                   <span className="sm:hidden text-gray-500 font-normal mr-2">Price:</span>
                   ₹{Number(item.price).toLocaleString()}
                 </div>

                 {/* Quantity Col */}
                 <div className="col-span-2 flex justify-center w-full sm:w-auto">
                    <div className="flex items-center border border-gray-300 rounded h-10 w-28">
                      <button onClick={() => updateQuantity(item.id, -1)} className="flex-1 flex justify-center text-gray-500"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="flex-1 flex justify-center text-gray-500"><Plus className="w-3 h-3" /></button>
                    </div>
                 </div>

                 {/* Subtotal Col */}
                 <div className="col-span-2 text-right text-sm font-bold text-[#20409a] w-full sm:w-auto">
                   <span className="sm:hidden text-gray-500 font-normal mr-2">Subtotal:</span>
                   ₹{(parseFloat(item.price || "0") * item.quantity).toLocaleString()}
                 </div>
               </div>
             ))}
           </div>

           {/* Coupons & Update Actions */}
           <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
              <div className="flex w-full sm:w-auto gap-2">
                <input 
                  type="text" 
                  placeholder="Coupon code" 
                  value={coupon}
                  onChange={(e)=>setCoupon(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2.5 text-sm w-full sm:w-48 focus:outline-none"
                />
                <button className="bg-[#b932c9] text-white px-6 py-2.5 rounded-md text-sm font-bold whitespace-nowrap">
                  APPLY COUPON
                </button>
              </div>
              <button className="w-full sm:w-auto bg-[#c87ee9] text-white px-8 py-2.5 rounded-md text-sm font-bold">
                UPDATE CART
              </button>
           </div>
        </div>

        {/* Right: Cart Totals Box */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-6 sm:p-8 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 uppercase mb-6">Cart Totals</h3>
            
            <div className="flex justify-between items-center py-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-800 uppercase">Subtotal</span>
              <span className="text-sm font-bold text-[#20409a]">₹{totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="py-4 border-b border-gray-100 flex flex-col items-end gap-2 text-sm">
               <div className="flex justify-between w-full">
                  <span className="font-bold text-gray-800 uppercase">Shipment 1</span>
                  <div className="text-right text-gray-600">
                    Flat rate (Shipping Charge): <span className="font-bold text-[#20409a]">₹100.00</span>
                  </div>
               </div>
               <span className="text-gray-500">Shipping to West Bengal.</span>
               <button className="text-[#b932c9] text-xs">Change address</button>
            </div>

            <div className="flex justify-between items-center py-6">
              <span className="text-lg font-bold text-gray-900 uppercase">Total</span>
              <span className="text-xl font-bold text-[#20409a]">₹{finalTotal.toLocaleString()}</span>
            </div>

            <button className="w-full py-4 bg-ss-gradient text-white rounded-lg font-bold uppercase tracking-wide text-sm shadow-md hover:opacity-90 transition-opacity mt-2">
              Proceed To Checkout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}