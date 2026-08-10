"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { 
  Plus, Minus, ShoppingCart, Star, 
  UserCircle, Loader2, Heart, ChevronLeft, ChevronRight,
  ShieldCheck, Truck, RotateCcw, Share2, Check, Copy, Tag, Info
} from "lucide-react";
import { getProductImage } from "@/lib/utils";
import ToastPopup from "@/components/ToastPopup";

interface ClientProductDetailProps {
  product: any;
  initialReviews: any[];
}

export default function ClientProductDetail({ product, initialReviews }: ClientProductDetailProps) {
  const router = useRouter();

  // Cart & Wishlist Context Bridge
  const cartContext = useCart() as any;
  const wishlistContext = useWishlist() as any;

  const addItem = cartContext?.addItem || cartContext?.addToCart || cartContext?.addItemToCart;
  const { toggleWishlist, isInWishlist } = wishlistContext;

  // Extract All Images from WooCommerce product
  const productImages: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img: any) => img.src)
    : [getProductImage(product)];

  // States
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping" | "reviews">("desc");
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewer: "", reviewer_email: "", review: "", rating: 5 });

  // Custom Popup State
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);

  const isLiked = isInWishlist ? isInWishlist(product.id) : false;

  // Price & Savings Calculations
  const regPrice = Number(product.regular_price || product.price || 0);
  const salePrice = Number(product.sale_price || product.price || 0);
  const hasDiscount = regPrice > salePrice && salePrice > 0;
  const discountPercent = hasDiscount ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 0;
  const currentPrice = salePrice > 0 ? salePrice : regPrice;

  // Helper function to show popup
  const showPopup = (message: string, type: "success" | "error") => {
    setPopup({ show: true, message, type });
    if (popupTimeout.current) clearTimeout(popupTimeout.current);
    popupTimeout.current = setTimeout(() => {
      setPopup({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Gallery Navigation Handlers
  const handlePrevImg = () => {
    setSelectedImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImg = () => {
    setSelectedImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  // Share Link Action
  const handleShareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showPopup("Product link copied to clipboard!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Review Submission
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
      
      const res = await fetch(`/api/reviews?product_id=${product.id}`);
      const newReviews = await res.json();
      setReviews(newReviews);
      
      router.refresh(); 
    } catch (error) {
      showPopup("Failed to submit review.", "error");
    } finally {
      setLoadingReviews(false);
    }
  };

  // Add to Cart Logic
  const handleAddToCart = () => {
    if (typeof addItem === "function") {
      addItem({ 
        id: product.id, 
        name: product.name, 
        slug: product.slug || String(product.id), 
        price: currentPrice, 
        quantity, 
        image: productImages[selectedImgIndex] || getProductImage(product),
        attributes: selectedAttributes
      }, quantity);
      showPopup("Added to Cart successfully!", "success");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    if (typeof toggleWishlist === "function") {
      toggleWishlist({
        id: product.id,
        name: product.name,
        slug: product.slug || String(product.id),
        price: currentPrice,
        image: productImages[selectedImgIndex] || getProductImage(product),
      });
      showPopup(
        isLiked ? "Removed from Wishlist" : "Added to Wishlist!",
        "success"
      );
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16 pt-4 sm:pt-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 gap-2 font-medium">
          <Link href="/" className="hover:text-[#d81b60] transition-colors">Home</Link><span>/</span>
          <Link href="/shop" className="hover:text-[#d81b60] transition-colors">Shop</Link><span>/</span>
          {product.categories?.[0] && (
            <>
              <Link href={`/shop?category=${product.categories[0].slug}`} className="hover:text-[#d81b60] transition-colors">
                {product.categories[0].name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800 truncate font-semibold">{product.name}</span>
        </nav>

        {/* TOP PRODUCT SHOWCASE SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8 md:p-10 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            
            {/* MULTI-IMAGE GALLERY WITH SLIDER */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square bg-[#fff7f9] rounded-3xl overflow-hidden border border-pink-100 flex items-center justify-center p-6 sm:p-10 group">
                
                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur p-3 rounded-full shadow-md text-gray-400 hover:text-[#d81b60] transition-all hover:scale-110 active:scale-95"
                  title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "text-[#d81b60] fill-current" : ""}`} />
                </button>

                {/* Main Selected Image */}
                <img 
                  src={productImages[selectedImgIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                />

                {/* Prev / Next Slider Arrows (Only if multiple images exist) */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md text-gray-800 hover:text-[#d81b60] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md text-gray-800 hover:text-[#d81b60] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Navigation Strip */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {productImages.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 bg-gray-50 p-1 flex-shrink-0 transition-all ${
                        selectedImgIndex === idx
                          ? "border-[#d81b60] ring-2 ring-pink-100 shadow-sm"
                          : "border-gray-200 hover:border-pink-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgSrc} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS & BUYING OPTIONS */}
            <div className="flex flex-col justify-center">
              {/* Category / Stock Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#8e24aa] uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  {product.categories?.[0]?.name || "Luxury Atelier"}
                </span>

                {/* Stock Indicator */}
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className={`w-2.5 h-2.5 rounded-full ${product.stock_status === "outofstock" ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                  <span className={product.stock_status === "outofstock" ? "text-red-600" : "text-emerald-700"}>
                    {product.stock_status === "outofstock" ? "Out of Stock" : "In Stock & Ready to Ship"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating & SKU */}
              <div className="flex items-center gap-4 mb-5 text-xs font-semibold text-gray-500 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 text-amber-900">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">4.9</span>
                  <span className="text-gray-400 font-normal">({reviews.length} reviews)</span>
                </div>

                {product.sku && (
                  <span className="font-mono text-gray-400">SKU: {product.sku}</span>
                )}

                <button
                  onClick={handleShareProduct}
                  className="ml-auto hover:text-[#d81b60] transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Share"}</span>
                </button>
              </div>

              {/* Price & Discount */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl sm:text-4xl font-black text-gray-900">
                  ${Number(currentPrice).toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-semibold">
                      ${Number(regPrice).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                      Save ${(regPrice - salePrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Dynamic Product Attributes / Variations (e.g. Shade / Size) */}
              {Array.isArray(product.attributes) && product.attributes.length > 0 && (
                <div className="space-y-4 mb-6 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  {product.attributes.map((attr: any) => (
                    <div key={attr.id || attr.name}>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                        Select {attr.name}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {attr.options?.map((option: string) => (
                          <button
                            key={option}
                            onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attr.name]: option }))}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              selectedAttributes[attr.name] === option
                                ? "bg-gray-900 text-white shadow-sm"
                                : "bg-white border border-gray-200 text-gray-700 hover:border-pink-300"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ACTION BUTTONS & QUANTITY */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
                {/* Quantity Controls */}
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-2xl h-12 sm:h-14 w-full sm:w-32 px-4 bg-gray-50">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-600 hover:text-black transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-base">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-600 hover:text-black transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Add To Cart */}
                <button 
                  onClick={handleAddToCart} 
                  disabled={product.stock_status === "outofstock"}
                  className="w-full sm:flex-1 h-12 sm:h-14 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-900 text-gray-900 font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> Add To Cart
                </button>
                
                {/* Buy It Now */}
                <button 
                  onClick={handleBuyNow} 
                  disabled={product.stock_status === "outofstock"}
                  className="w-full sm:flex-1 h-12 sm:h-14 flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#d81b60] to-[#8e24aa] text-white font-bold text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy It Now
                </button>
              </div>

              {/* VALUE PROPOSITION BADGES */}
              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
                <div className="flex flex-col items-center text-center p-2">
                  <ShieldCheck className="w-5 h-5 text-[#d81b60] mb-1" />
                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 border-x border-gray-100">
                  <Truck className="w-5 h-5 text-[#d81b60] mb-1" />
                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Express Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <RotateCcw className="w-5 h-5 text-[#d81b60] mb-1" />
                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">7-Day Easy Return</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* END-TO-END TABBED CONTENT SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-12">
          
          {/* Tabs Navigation Strip */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar gap-8">
            <button
              onClick={() => setActiveTab("desc")}
              className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "desc" ? "text-[#d81b60]" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Description
              {activeTab === "desc" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d81b60]" />}
            </button>

            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "specs" ? "text-[#d81b60]" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Specifications & Info
              {activeTab === "specs" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d81b60]" />}
            </button>

            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "shipping" ? "text-[#d81b60]" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Shipping & Policy
              {activeTab === "shipping" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d81b60]" />}
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "reviews" ? "text-[#d81b60]" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Customer Reviews ({reviews.length})
              {activeTab === "reviews" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d81b60]" />}
            </button>
          </div>

          {/* TAB 1: DESCRIPTION */}
          {activeTab === "desc" && (
            <div className="prose prose-pink max-w-none text-gray-600 text-sm leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: product.description || product.short_description || "Indulge in luxury premium beauty curated specifically for long-lasting perfection.",
                }}
              />
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === "specs" && (
            <div className="max-w-2xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <tbody>
                  {product.sku && (
                    <tr className="border-b border-gray-100">
                      <td className="py-3 font-bold text-gray-500 w-1/3">SKU</td>
                      <td className="py-3 font-mono font-medium text-gray-800">{product.sku}</td>
                    </tr>
                  )}
                  {product.weight && (
                    <tr className="border-b border-gray-100">
                      <td className="py-3 font-bold text-gray-500">Weight</td>
                      <td className="py-3 font-medium text-gray-800">{product.weight} kg</td>
                    </tr>
                  )}
                  {Array.isArray(product.attributes) &&
                    product.attributes.map((attr: any) => (
                      <tr key={attr.name} className="border-b border-gray-100">
                        <td className="py-3 font-bold text-gray-500">{attr.name}</td>
                        <td className="py-3 font-medium text-gray-800">{attr.options?.join(", ")}</td>
                      </tr>
                    ))}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-bold text-gray-500">Stock Status</td>
                    <td className="py-3 font-medium text-gray-800 capitalize">{product.stock_status || "In Stock"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: SHIPPING */}
          {activeTab === "shipping" && (
            <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
              <p className="font-semibold text-gray-800">
                📦 Express Domestic Shipping (2-4 Business Days)
              </p>
              <p>
                All orders are dispatched from our luxury atelier warehouse within 24 hours. You will receive a live tracking link via SMS & email as soon as your package ships.
              </p>
              <p className="font-semibold text-gray-800 pt-2">
                🔄 Easy 7-Day Hassle-Free Returns
              </p>
              <p>
                If your order arrives damaged or incorrect, our concierge team will arrange a complimentary replacement or instant refund within 7 days.
              </p>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Existing Reviews */}
              <div>
                {loadingReviews ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#d81b60]" /></div>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-gray-100 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-8 h-8 text-gray-300" />
                            <span className="font-bold text-gray-900 text-sm">{rev.reviewer}</span>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm pl-10" dangerouslySetInnerHTML={{ __html: rev.review }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Write a Review Form */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-600">Your Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })} 
                          className={`w-5 h-5 cursor-pointer ${star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      required 
                      type="text" 
                      placeholder="Your Name" 
                      value={reviewForm.reviewer} 
                      onChange={(e) => setReviewForm({...reviewForm, reviewer: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#d81b60]" 
                    />
                    <input 
                      required 
                      type="email" 
                      placeholder="Your Email" 
                      value={reviewForm.reviewer_email} 
                      onChange={(e) => setReviewForm({...reviewForm, reviewer_email: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#d81b60]" 
                    />
                  </div>
                  <textarea 
                    required 
                    placeholder="Write your review here..." 
                    rows={4} 
                    value={reviewForm.review} 
                    onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#d81b60]"
                  ></textarea>
                  <button 
                    type="submit" 
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#d81b60] transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}

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