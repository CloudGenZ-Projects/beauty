// app/shop/[slug]/ClientProductDetail.tsx
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { 
  Plus, Minus, ShoppingCart, Star, 
  UserCircle, Loader2 
} from "lucide-react";
import { getProductImage } from "@/lib/utils";
import ToastPopup from "@/components/ToastPopup"; // Adjust path if needed

interface ClientProductDetailProps {
  product: any;
  initialReviews: any[];
}

export default function ClientProductDetail({ product, initialReviews }: ClientProductDetailProps) {
  const router = useRouter();
  
  // States
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewer: "", reviewer_email: "", review: "", rating: 5 });

  // Custom Popup State
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);

  const { addItem } = useCart();

  // Helper function to show popup
  const showPopup = (message: string, type: "success" | "error") => {
    setPopup({ show: true, message, type });
    if (popupTimeout.current) clearTimeout(popupTimeout.current);
    popupTimeout.current = setTimeout(() => {
      setPopup({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingReviews(true);
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, ...reviewForm })
      });
      showPopup("Review submitted successfully!", "success");
      setReviewForm({ reviewer: "", reviewer_email: "", review: "", rating: 5 });
      
      // Refresh reviews from the server
      const res = await fetch(`/api/reviews?product_id=${product.id}`);
      const newReviews = await res.json();
      setReviews(newReviews);
      
      // Optional: Refresh the server component in background
      router.refresh(); 
    } catch (error) {
      showPopup("Failed to submit review.", "error");
    } finally {
      setLoadingReviews(false);
    }
  };

  const imgUrl = getProductImage(product);
  const currentPrice = product.sale_price || product.price || "0";

  // Buy Now Logic: Add to cart and redirect immediately to checkout
  const handleBuyNow = () => {
    addItem({ 
      id: product.id, 
      name: product.name, 
      slug: product.slug || String(product.id), 
      price: currentPrice, 
      quantity, 
      image: imgUrl 
    });
    router.push('/checkout'); // Update to '/cart' if your checkout page path is different
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16 pt-4 sm:pt-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 gap-2 font-medium">
          <Link href="/" className="hover:text-[#d81b60]">Home</Link><span>/</span>
          <Link href="/shop" className="hover:text-[#d81b60]">Shop</Link><span>/</span>
          <span className="text-gray-800 truncate">{product.name}</span>
        </nav>

        {/* Top Product Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-10 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Image Gallery */}
            <div className="relative group">
              <div className="aspect-square bg-[#fff5f8] rounded-2xl overflow-hidden border border-pink-50 flex items-center justify-center p-6 sm:p-8">
                <img 
                  src={imgUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <div className="text-xs font-bold text-[#8e24aa] uppercase tracking-widest mb-2 sm:mb-3">
                {product.categories?.[0]?.name || "Premium Collection"}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-black text-gray-900">
                  ₹{Number(currentPrice).toLocaleString()}
                </span>
              </div>
              <div className="w-full h-px bg-gray-100 my-2"></div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-6 sm:py-8">
                {/* Quantity Controls */}
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-lg h-12 sm:h-14 w-full sm:w-32 px-4 bg-gray-50">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-600 hover:text-black transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-600 hover:text-black transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Add To Cart */}
                <button 
                  onClick={() => addItem({ id: product.id, name: product.name, slug: product.slug || String(product.id), price: currentPrice, quantity, image: imgUrl })} 
                  className="w-full sm:flex-1 h-12 sm:h-14 flex items-center justify-center gap-2 rounded-lg border-2 border-black text-black font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> Add To Cart
                </button>
                
                {/* Buy It Now */}
                <button 
                  onClick={handleBuyNow} 
                  className="w-full sm:flex-1 h-12 sm:h-14 flex items-center justify-center rounded-lg bg-gradient-to-r from-[#d81b60] to-[#8e24aa] text-white font-bold text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Buy It Now
                </button>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mb-2 sm:mb-3">Product Description</h3>
                <div 
                  className="text-gray-600 text-sm leading-loose" 
                  dangerouslySetInnerHTML={{ __html: product.description || "Indulge in luxury premium beauty curated for you." }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-10">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-gray-900 mb-6 sm:mb-8 border-b border-gray-100 pb-4">
            Customer Reviews
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Display Reviews */}
            <div>
              {loadingReviews ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#d81b60]" /></div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 sm:pr-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-8 h-8 text-gray-300" />
                          <span className="font-bold text-gray-900">{rev.reviewer}</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < rev.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <div className="text-gray-600 text-sm pl-10" dangerouslySetInnerHTML={{ __html: rev.review }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Form */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <span className="text-sm font-bold text-gray-600">Your Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })} 
                        className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer ${star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    required 
                    type="text" 
                    placeholder="Name" 
                    value={reviewForm.reviewer} 
                    onChange={(e) => setReviewForm({...reviewForm, reviewer: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60]" 
                  />
                  <input 
                    required 
                    type="email" 
                    placeholder="Email" 
                    value={reviewForm.reviewer_email} 
                    onChange={(e) => setReviewForm({...reviewForm, reviewer_email: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60]" 
                  />
                </div>
                <textarea 
                  required 
                  placeholder="Write your review here..." 
                  rows={4} 
                  value={reviewForm.review} 
                  onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60]"
                ></textarea>
                <button 
                  type="submit" 
                  className="w-full bg-black text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#d81b60] transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      <ToastPopup 
        show={popup.show} 
        message={popup.message} 
        type={popup.type as "success" | "error"} 
        onClose={() => setPopup({ ...popup, show: false })} 
      />

    </div>
  );
}