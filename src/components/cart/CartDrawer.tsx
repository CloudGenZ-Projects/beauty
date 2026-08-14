"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const router = useRouter();

  const handleGoToBag = () => {
    closeCart();
    router.push("/cart");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-[#FAF9F6] border-l border-[#E5E5E5] z-50 flex flex-col justify-between shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 md:p-8 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#666666] font-semibold">
                  GLOBE TRADING  PARIS
                </span>
                <h3 className="font-outfit text-2xl md:text-3xl uppercase tracking-tight font-extrabold text-[#111111] mt-1 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  <span>Bag ({totalItems})</span>
                </h3>
              </div>
              <button
                onClick={closeCart}
                className="p-2 border border-[#E5E5E5] hover:border-[#111111] transition-colors rounded-full"
                aria-label="Close Bag"
              >
                <X className="w-5 h-5 text-[#111111]" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 divide-y divide-[#E5E5E5]">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-24">
                  <div className="w-16 h-16 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center text-[#666666]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-outfit text-xl uppercase font-bold text-[#111111]">Your Bag Is Empty</h4>
                  <p className="font-mono text-xs text-[#666666] max-w-xs">
                    Explore our curated Parisian and Korean biotech formulas.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="pt-6 first:pt-0 flex gap-4 items-start">
                    <div className="w-20 h-24 bg-[#EFECE6] border border-[#E5E5E5] overflow-hidden flex-shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-outfit text-sm font-bold uppercase line-clamp-1 text-[#111111]">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#666666] hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#111111]">
                        RS. {Number(item.price).toLocaleString()}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-[#111111] bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1.5 hover:bg-[#111111] hover:text-[#FAF9F6] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 hover:bg-[#111111] hover:text-[#FAF9F6] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          RS. {(parseFloat(item.price || "0") * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / CTA Panel */}
            {items.length > 0 && (
              <div className="p-6 md:p-8 bg-white border-t border-[#E5E5E5] space-y-5 shadow-lg">
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#111111]">RS. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>Grasse Dispatch</span>
                    <span className="text-[#111111] font-bold uppercase bg-[#e9ecd8] px-2 py-0.5 rounded">Complimentary</span>
                  </div>
                  <div className="flex justify-between items-end font-outfit text-2xl font-extrabold text-[#111111] pt-2 border-t border-[#E5E5E5]">
                    <span>Total</span>
                    <span>RS. {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <button
                    onClick={handleGoToBag}
                    className="w-full py-4.5 bg-[#111111] text-[#FAF9F6] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/80 transition-all cursor-pointer font-bold shadow-xl"
                  >
                    <span>GO TO DEDICATED BAG ({totalItems})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={closeCart}
                    className="w-full py-3 text-center font-mono text-[11px] uppercase tracking-widest text-[#666666] hover:text-[#111111] transition-colors underline"
                  >
                    Continue Exploring Formulations
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
