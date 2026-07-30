"use client";
import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fcfcfc] text-center px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
           <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-widest">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our top categories and find your new favorites.</p>
        <Link href="/shop" className="bg-black text-white px-10 py-4 rounded font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-[#d81b60] transition-colors">
           Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 md:py-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-gray-900 mb-10 border-b border-gray-200 pb-6">Shopping Bag ({totalItems})</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                <Link href={`/shop/${item.slug}`} className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                </Link>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-[#d81b60] transition-colors"><Link href={`/shop/${item.slug}`}>{item.name}</Link></h3>
                  <p className="text-[#d81b60] font-black mt-1">₹{Number(item.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center border-2 border-gray-200 rounded-md bg-gray-50 px-2 h-10">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-[#d81b60]"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-[#d81b60]"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 bg-red-50 p-2 rounded-full transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>
              <div className="space-y-4 text-sm font-medium text-gray-600 mb-6">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="text-green-600 font-bold uppercase text-xs tracking-wider bg-green-50 px-2 py-1 rounded">Free</span></div>
                <div className="flex justify-between"><span>Estimated Tax</span><span className="font-bold text-gray-900">Calculated at checkout</span></div>
              </div>
              <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-3xl font-black text-[#d81b60]">₹{totalPrice.toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="w-full bg-black text-white py-4 rounded flex justify-center items-center gap-2 font-bold uppercase tracking-widest text-sm hover:bg-[#d81b60] transition-colors shadow-xl">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}