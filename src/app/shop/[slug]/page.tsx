"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Eye, ShoppingCart, Truck, Share2 } from "lucide-react";
import { getProductImage } from "@/app/page";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? decodeURIComponent(rawSlug) : "";
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const { addItem, openCart } = useCart();

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not Found");
        return res.json();
      })
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
        } else if (data.id) { 
          setProduct(data);
        } else {
          setProduct(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setProduct(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fcfcfc]">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-[#d81b60] border-t-transparent rounded-full animate-spin"></div>
           <div className="text-gray-500 font-bold uppercase tracking-widest">Loading Details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fcfcfc] text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <button onClick={() => router.push('/shop')} className="bg-[#d81b60] text-white px-8 py-3 rounded font-bold hover:bg-black transition-colors">
           Back to Shop
        </button>
      </div>
    );
  }

  const imgUrl = getProductImage(product);
  const currentPrice = product.sale_price || product.price || "0";
  const originalPrice = product.regular_price || (Number(currentPrice) * 1.25).toFixed(2);

  const handleAddToCart = () => {
    addItem({
      id: product.id, name: product.name, slug: product.slug || String(product.id), 
      price: currentPrice, quantity: quantity, image: imgUrl,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    openCart();
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex text-gray-400 text-xs sm:text-sm mb-6 gap-2 font-medium">
          <Link href="/" prefetch={false} className="hover:text-[#d81b60]">Home</Link>
          <span>/</span>
          <Link href="/shop" prefetch={false} className="hover:text-[#d81b60]">Shop</Link>
          <span>/</span>
          <span className="text-gray-800 truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-4">
              <div className="aspect-square bg-[#fff5f8] rounded-2xl overflow-hidden border border-pink-50 flex items-center justify-center p-8 relative group">
                <img src={imgUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className={`w-20 h-20 rounded-xl border-2 cursor-pointer p-2 bg-white flex-shrink-0 transition-all ${i === 1 ? 'border-[#d81b60] shadow-md' : 'border-gray-100 hover:border-pink-300'}`}>
                        <img src={imgUrl} className="w-full h-full object-contain" />
                    </div>
                 ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-xs font-bold text-[#8e24aa] uppercase tracking-widest mb-3">
                {product.categories?.[0]?.name || "Premium Collection"}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>
              
              <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 text-pink-700 px-3 py-1.5 rounded-full text-xs font-bold mb-6 w-max">
                <Eye className="w-4 h-4 animate-pulse" /><span>24 People watching this now</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl sm:text-4xl font-black text-gray-900">₹{Number(currentPrice).toLocaleString()}</span>
                {originalPrice !== currentPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-medium">₹{Number(originalPrice).toLocaleString()}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Sale</span>
                  </>
                )}
              </div>
              <div className="w-full h-px bg-gray-100 my-2"></div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 py-8">
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-lg h-14 w-full sm:w-32 px-2 bg-gray-50">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-md transition-all"><Minus className="w-4 h-4" /></button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-md transition-all"><Plus className="w-4 h-4" /></button>
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={handleAddToCart} className="flex-1 h-14 flex items-center justify-center gap-2 rounded-lg border-2 border-black text-black font-bold text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                    <ShoppingCart className="w-4 h-4" /> Add To Cart
                  </button>
                  <button onClick={handleBuyNow} className="flex-1 h-14 rounded-lg bg-gradient-to-r from-[#d81b60] to-[#8e24aa] text-white font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5">
                    Buy It Now
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl mb-8 border border-gray-200">
                <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Truck className="w-5 h-5 text-gray-600" /> Check Expected Delivery Date</div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d81b60] bg-white transition-colors" />
                  <button className="bg-black text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors uppercase tracking-wide">Check</button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-extrabold text-gray-900 mb-3">Product Description</h3>
                <div className="text-gray-600 text-sm leading-loose" dangerouslySetInnerHTML={{ __html: product.description || "Indulge in luxury creamy textures curated for every occasion. Experience the premium quality designed specifically to elevate your beauty routine." }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}