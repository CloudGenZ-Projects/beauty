"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { 
  Plus, Minus, ShoppingCart, Heart, Star, 
  UserCircle, Loader2 
} from "lucide-react";
import { getProductImage } from "@/app/page";

// Import the new component (adjust the path based on where you saved it)
import ToastPopup from "@/components/ToastPopup";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? decodeURIComponent(rawSlug) : "";
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewer: "", reviewer_email: "", review: "", rating: 5 });

  // Custom Popup State
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);

  const { addItem, openCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const prod = data.product || data;
        setProduct(prod);
        setLoading(false);
        if (prod?.id) fetchReviews(prod.id);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const fetchReviews = async (id: number) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${id}`);
      const data = await res.json();
      setReviews(data || []);
    } catch (e) {
      console.error("Failed to fetch reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  // Helper function to show popup
  const showPopup = (message: string, type: "success" | "error") => {
    setPopup({ show: true, message, type });
    
    // Clear existing timeout if user submits rapidly
    if (popupTimeout.current) clearTimeout(popupTimeout.current);
    
    // Auto-hide after 3 seconds
    popupTimeout.current = setTimeout(() => {
      setPopup({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, ...reviewForm })
      });
      showPopup("Review submitted successfully!", "success");
      setReviewForm({ reviewer: "", reviewer_email: "", review: "", rating: 5 });
      fetchReviews(product.id); // Refresh reviews
    } catch (error) {
      showPopup("Failed to submit review.", "error");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#d81b60]" /></div>;
  }

  if (!product) {
    return <div className="min-h-[60vh] flex items-center justify-center">Product Not Found</div>;
  }

  const imgUrl = getProductImage(product);
  const currentPrice = product.sale_price || product.price || "0";
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = () => {
    if (isWishlisted) removeFromWishlist(product.id);
    else addToWishlist({ id: product.id, name: product.name, slug: product.slug || String(product.id), price: currentPrice, image: imgUrl });
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16 pt-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex text-gray-400 text-xs sm:text-sm mb-6 gap-2 font-medium">
          <Link href="/" className="hover:text-[#d81b60]">Home</Link><span>/</span>
          <Link href="/shop" className="hover:text-[#d81b60]">Shop</Link><span>/</span>
          <span className="text-gray-800 truncate">{product.name}</span>
        </nav>

        {/* Top Product Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Image Gallery */}
            <div className="relative group">
              <button onClick={toggleWishlist} className="absolute top-4 right-4 z-10 bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform">
                <Heart className={`w-6 h-6 ${isWishlisted ? "fill-[#d81b60] text-[#d81b60]" : "text-gray-400"}`} />
              </button>
              <div className="aspect-square bg-[#fff5f8] rounded-2xl overflow-hidden border border-pink-50 flex items-center justify-center p-8">
                <img src={imgUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="text-xs font-bold text-[#8e24aa] uppercase tracking-widest mb-3">
                {product.categories?.[0]?.name || "Premium Collection"}
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-gray-900">₹{Number(currentPrice).toLocaleString()}</span>
              </div>
              <div className="w-full h-px bg-gray-100 my-2"></div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 py-8">
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-lg h-14 w-full sm:w-32 px-2 bg-gray-50">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2"><Minus className="w-4 h-4" /></button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2"><Plus className="w-4 h-4" /></button>
                </div>
                
                <button onClick={() => addItem({ id: product.id, name: product.name, slug: product.slug, price: currentPrice, quantity, image: imgUrl })} className="flex-1 h-14 flex items-center justify-center gap-2 rounded-lg border-2 border-black text-black font-bold text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" /> Add To Cart
                </button>
                <button onClick={() => { addItem({ id: product.id, name: product.name, slug: product.slug, price: currentPrice, quantity, image: imgUrl }); openCart(); }} className="flex-1 h-14 rounded-lg bg-gradient-to-r from-[#d81b60] to-[#8e24aa] text-white font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all">
                  Buy It Now
                </button>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-3">Product Description</h3>
                <div className="text-gray-600 text-sm leading-loose" dangerouslySetInnerHTML={{ __html: product.description || "Indulge in luxury premium beauty curated for you." }} />
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-8 border-b border-gray-100 pb-4">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Display Reviews */}
            <div>
              {loadingReviews ? (
                <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#d81b60]" /></div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-8 h-8 text-gray-300" />
                          <span className="font-bold text-gray-900">{rev.reviewer}</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < rev.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
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
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-bold text-gray-600">Your Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className={`w-6 h-6 cursor-pointer ${star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Name" value={reviewForm.reviewer} onChange={(e) => setReviewForm({...reviewForm, reviewer: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d81b60]" />
                  <input required type="email" placeholder="Email" value={reviewForm.reviewer_email} onChange={(e) => setReviewForm({...reviewForm, reviewer_email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d81b60]" />
                </div>
                <textarea required placeholder="Write your review here..." rows={4} value={reviewForm.review} onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d81b60]"></textarea>
                <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#d81b60] transition-colors">Submit Review</button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* Reusable Popup Component */}
      <ToastPopup 
        show={popup.show} 
        message={popup.message} 
        type={popup.type} 
        onClose={() => setPopup({ ...popup, show: false })} 
      />

    </div>
  );
}