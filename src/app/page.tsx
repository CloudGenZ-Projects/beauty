"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, ChevronRight, ChevronLeft, Zap, Star, LayoutGrid } from "lucide-react";

const CIRCULAR_DEALS = [
  { label: "Under ₹99", price: "99", highlight: false, type: "under", color: "border-[#ffb74d]", link: "/shop?max_price=99" },
  { label: "Under ₹199", price: "199", highlight: false, type: "under", color: "border-[#4db6ac]", link: "/shop?max_price=199" },
  { label: "Under ₹299", price: "299", highlight: false, type: "under", color: "border-[#0288d1]", link: "/shop?max_price=299" },
  { label: "Under ₹399", price: "399", highlight: false, type: "under", color: "border-[#00e676]", link: "/shop?max_price=399" },
  { label: "Under ₹499", price: "499", highlight: false, type: "under", color: "border-[#80cbc4]", link: "/shop?max_price=499" },
  { label: "Under ₹599", price: "599", highlight: false, type: "under", color: "border-[#ba68c8]", link: "/shop?max_price=599" },
  { label: "Under ₹799", price: "799", highlight: false, type: "under", color: "border-[#f06292]", link: "/shop?max_price=799" },
  { label: "Under ₹999", price: "999", highlight: true, type: "under", color: "border-[#d32f2f]", link: "/shop?max_price=999" },
  { label: "10% OFF", price: "10", type: "off", link: "/shop?discount=10" },
  { label: "15% OFF", price: "15", type: "off", link: "/shop?discount=15" },
  { label: "20% OFF", price: "20", type: "off", link: "/shop?discount=20" },
  { label: "25% OFF", price: "25", type: "off", link: "/shop?discount=25" },
  { label: "30% OFF", price: "30", type: "off", link: "/shop?discount=30" },
  { label: "35% OFF", price: "35", type: "off", link: "/shop?discount=35" },
  { label: "40% OFF", price: "40", type: "off", link: "/shop?discount=40" },
  { label: "50% OFF", price: "50", type: "off", link: "/shop?discount=50" },
  { label: "FLAT ₹500", price: "500", highlight: true, type: "flat", color: "border-[#8e24aa]", link: "/shop?offer=flat500" },
];

const BANNER_STYLES = [
  { bg: "bg-[#0a0a0a]", text: "text-white", accent: "text-[#a8e6cf]", label: "New At", border: "border-[#8e24aa]" }, 
  { bg: "bg-[#f5f0eb]", text: "text-gray-900", accent: "text-[#d81b60]", label: "Trending", border: "border-pink-300" }, 
  { bg: "bg-[#2d1b2e]", text: "text-[#e8d5b5]", accent: "text-white", label: "Luxury", border: "border-[#4a2c4b]" }, 
  { bg: "bg-gradient-to-br from-pink-900 to-black", text: "text-white", accent: "text-pink-300", label: "Exclusive", border: "border-pink-800" }, 
  { bg: "bg-[#111827]", text: "text-gray-100", accent: "text-[#fcd34d]", label: "Premium", border: "border-gray-700" }, 
  { bg: "bg-gradient-to-r from-[#fdfbfb] to-[#ebedee]", text: "text-black", accent: "text-gray-600", label: "Essentials", border: "border-gray-300" }, 
  { bg: "bg-[#4a044e]", text: "text-white", accent: "text-[#fbcfe8]", label: "Bestseller", border: "border-[#701a75]" }, 
  { bg: "bg-[#1c1917]", text: "text-white", accent: "text-[#fdba74]", label: "Glamour", border: "border-orange-900" }, 
  { bg: "bg-[#fce4ec]", text: "text-[#880e4f]", accent: "text-[#c2185b]", label: "Glow Now", border: "border-pink-400" }, 
  { bg: "bg-[#0f172a]", text: "text-white", accent: "text-[#38bdf8]", label: "Pro Artistry", border: "border-blue-900" }, 
];

export function getProductImage(prod: any): string {
  if (prod?.images && prod.images.length > 0) {
    return prod.images[0].src || prod.images[0].source_url || prod.images[0].url;
  }
  return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"; 
}

export function getCategoryImage(cat: any): string {
  if (cat?.image) {
    if (typeof cat.image === 'string') return cat.image;
    if (cat.image.src) return cat.image.src;
    if (cat.image.source_url) return cat.image.source_url;
    if (cat.image.url) return cat.image.url;
  }
  const brandName = encodeURIComponent(cat?.name || "Brand");
  return `https://ui-avatars.com/api/?name=${brandName}&background=ffffff&color=000000&size=256&font-size=0.3&bold=true`;
}

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/products?per_page=100")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));

    fetch("/api/categories?per_page=100")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        setLoadingCategories(false);
      })
      .catch(() => setLoadingCategories(false));
  }, []);

  const getSafeItems = (arr: any[], start: number, count: number) => {
    if (!arr || arr.length === 0) return [];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(arr[(start + i) % arr.length]);
    }
    return result;
  };

  const renderProductGrid = (title: string, productsSlice: any[], ribbonBg: string, containerBg: string) => (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className={`${ribbonBg} text-white py-3 px-4 md:px-8 text-sm md:text-xl font-extrabold max-w-[100vw] overflow-hidden uppercase tracking-widest shadow-md`}>
         {title}
      </div>
      <div className={`${containerBg} p-4 md:p-8`}>
        <div className="max-w-[1600px] mx-auto">
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 animate-pulse">
               {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-[280px]"></div>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
              {productsSlice.map((prod, index) => {
                const imgUrl = getProductImage(prod);
                const currentPrice = prod.sale_price || prod.price || "0";
                const originalPrice = prod.regular_price || (Number(currentPrice) * 1.25).toFixed(2);
                const uniqueKey = `grid-${title.replace(/\s+/g, '')}-${prod.id}-${index}`;
                const safeSlug = prod.slug || prod.id;

                return (
                  <div key={uniqueKey} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col group border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative h-full">
                    <div className="absolute top-2 left-2 z-10 bg-black/80 text-white text-[9px] md:text-[10px] px-2 py-1 rounded shadow-sm tracking-wider font-semibold">
                      Featured
                    </div>
                    <Link href={`/shop/${safeSlug}`} prefetch={false} className="block relative h-48 md:h-56 p-4 bg-white flex-shrink-0">
                      <img src={imgUrl} alt={prod.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                    <div className="p-3 md:p-4 flex flex-col flex-1 text-center border-t border-gray-50">
                      <Link href={`/shop/${safeSlug}`} prefetch={false} className="text-[11px] md:text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#d81b60] min-h-[32px] md:min-h-[40px] mb-3 transition-colors">
                        {prod.name}
                      </Link>
                      <div className="mt-auto flex flex-col gap-3">
                         <div className="flex items-center justify-center gap-2">
                            {originalPrice !== currentPrice && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">₹{Number(originalPrice).toLocaleString()}</span>
                            )}
                            <span className="text-sm sm:text-lg font-black text-[#b456c8]">₹{Number(currentPrice).toLocaleString()}</span>
                         </div>
                         <button
                           onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation();
                              addItem({ id: prod.id, name: prod.name, slug: safeSlug, price: currentPrice, quantity: 1, image: imgUrl });
                           }}
                           className="w-full py-2.5 bg-black text-white text-[10px] sm:text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-[#d81b60] transition-colors shadow-sm uppercase tracking-wider"
                         >
                           Quick Shop
                         </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex justify-center mt-10">
             <Link href="/shop" prefetch={false} className="bg-black text-white px-12 py-3.5 rounded-md shadow-lg text-sm font-bold hover:bg-[#d81b60] transition-colors uppercase tracking-widest">
                Show More
             </Link>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="w-full overflow-hidden bg-white">
      
      {/* 1. Circular Discount Deals */}
      <section className="bg-[#fce4ec] py-4 md:py-6 w-full border-b border-pink-200">
        <div className="max-w-[100vw] mx-auto px-4 overflow-x-auto scrollbar-hide snap-x">
          <div className="flex items-center gap-4 md:gap-8 min-w-max px-2">
            {CIRCULAR_DEALS.map((deal, idx) => {
               const targetProduct = products.length > 0 ? products[idx % products.length] : null;
               const linkHref = targetProduct ? `/shop/${targetProduct.slug || targetProduct.id}` : "/shop";

               return (
                 <Link href={linkHref} prefetch={false} key={idx} className="flex flex-col items-center gap-2 cursor-pointer group snap-start">
                   <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-white shadow-md flex items-center justify-center p-1 transition-transform group-hover:scale-105">
                     {deal.type === "under" ? (
                       <div className={`w-full h-full rounded-full flex flex-col items-center justify-center ${deal.highlight ? 'bg-[#d32f2f] text-white shadow-inner' : `border-[4px] ${deal.color} bg-white`}`}>
                         <span className={`text-[8px] md:text-[10px] font-bold uppercase ${deal.highlight ? 'text-white' : 'text-gray-500'}`}>{deal.highlight ? 'All Under' : 'Under'}</span>
                         <span className={`text-lg md:text-xl font-black leading-none ${deal.highlight ? 'text-white' : 'text-[#000]'}`}><span className="text-xs">₹</span>{deal.price}</span>
                       </div>
                     ) : deal.type === "flat" ? (
                        <div className={`w-full h-full rounded-full flex flex-col items-center justify-center ${deal.highlight ? 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white shadow-inner' : `border-[4px] ${deal.color} bg-white`}`}>
                         <span className="text-[9px] md:text-[11px] font-bold uppercase">FLAT</span>
                         <span className="text-lg md:text-xl font-black leading-none"><span className="text-xs">₹</span>{deal.price}</span>
                        </div>
                     ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex flex-col items-center justify-center shadow-inner font-black text-xl md:text-3xl leading-none shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                          <span className="drop-shadow-md">{deal.price}<span className="text-sm">%</span></span>
                        </div>
                     )}
                   </div>
                   <span className="text-[10px] md:text-xs font-semibold text-gray-800 tracking-wide text-center group-hover:text-pink-600 transition-colors">{deal.label}</span>
                 </Link>
               )
            })}
          </div>
        </div>
      </section>

      {/* 2. Handpicked For You - Categories */}
     {/* 2. NEW PREMIUM UI: Handpicked For You - All Collection */}
      <section className="py-12 md:py-16 bg-[#faf6f0]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <span className="text-pink-500 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-2 block">
              Discover Your Favorites
            </span>
            <Link href="/shop" prefetch={false} className="inline-block group">
               <h2 className="text-3xl md:text-5xl font-black text-gray-900 flex items-center justify-center gap-2 group-hover:text-[#d81b60] transition-colors uppercase tracking-tight">
                 All <span className="text-[#d81b60] font-light">Collection</span>
               </h2>
            </Link>
            <div className="flex items-center justify-center gap-2 mt-5">
               <div className="h-px bg-gray-300 w-12 md:w-20"></div>
               <div className="h-1.5 w-1.5 bg-[#d81b60] rounded-full"></div>
               <div className="h-px bg-gray-300 w-12 md:w-20"></div>
            </div>
          </div>

          {/* Categories Grid - Centered items */}
          {loadingCategories ? (
             <div className="flex flex-wrap justify-center gap-4 md:gap-6 animate-pulse">
                {[...Array(10)].map((_, i) => (
                   <div key={i} className="w-[30%] sm:w-[22%] md:w-[15%] lg:w-[11%] bg-white h-32 md:h-40 rounded-2xl shadow-sm border border-gray-100"></div>
                ))}
             </div>
          ) : (
             <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {categories.map((cat) => (
                  <Link 
                    href={`/shop?category=${cat.slug || cat.id}`} 
                    prefetch={false} 
                    key={cat.id} 
                    className="w-[30%] sm:w-[22%] md:w-[15%] lg:w-[11%] bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden flex flex-col items-center p-3 md:p-5 group relative"
                  >
                    {/* Image Container with subtle background change on hover */}
                    <div className="w-full aspect-square flex items-center justify-center mb-3 overflow-hidden bg-gray-50/50 rounded-xl p-3 group-hover:bg-pink-50 transition-colors duration-300">
                      <img 
                         src={getCategoryImage(cat)} 
                         alt={cat.name} 
                         className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                    
                    {/* Category Title */}
                    <span className="text-[10px] md:text-xs font-extrabold text-center text-gray-800 line-clamp-2 w-full mt-auto uppercase tracking-wide group-hover:text-[#d81b60] transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                ))}
             </div>
          )}
          
          {/* Explore Button */}
          <div className="flex justify-center mt-12 md:mt-14">
             <Link 
               href="/shop" 
               prefetch={false} 
               className="group flex items-center gap-3 bg-white border-2 border-black text-black px-8 py-3.5 rounded-full text-xs md:text-sm font-bold hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest shadow-md hover:shadow-xl"
             >
                <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 group-hover:text-white transition-colors" />
                Explore All Collections
             </Link>
          </div>
        </div>
      </section>
      {/* --- GRID 1: Right after "All Collection" --- */}
      {renderProductGrid("Recent Top Selling Product", getSafeItems(products, 0, 10), "bg-[#b456c8]", "bg-[#ea93f6]")}

      {/* --- EXCLUSIVE BRANDS PART 1 --- */}
      <section className="py-12 bg-white max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col gap-12">
        {categories.slice(0, 4).map((brand, index) => {
           if (loadingProducts) return null;
           let brandSpecificProducts = products.filter(p => p.categories?.some((c: any) => c.id === brand.id || c.slug === brand.slug));
           let displayProducts = brandSpecificProducts.length > 0 ? getSafeItems(brandSpecificProducts, 0, 15) : getSafeItems(products, index * 5, 15);
           const style = BANNER_STYLES[index % BANNER_STYLES.length];

           return (
             <div key={`showcase-1-${brand.id}`} className={`w-full flex flex-col lg:flex-row border-[3px] ${style.border} bg-[#fcf8f2] rounded-md overflow-hidden shadow-lg`}>
                <div className={`w-full lg:w-[35%] relative flex flex-col justify-center items-center p-8 text-center min-h-[300px] lg:min-h-[450px] ${style.bg} ${style.text}`}>
                   <div className="relative z-10">
                      <h3 className={`text-xl md:text-2xl font-light tracking-widest ${style.accent} mb-4 uppercase`}>{style.label} <span className="font-bold">{brand.name.split(' ')[0]}</span></h3>
                      <div className="bg-white/90 p-4 rounded-xl shadow-lg mb-6 inline-block min-w-[150px]">
                        <img src={getCategoryImage(brand)} alt={brand.name} className="h-16 md:h-24 w-full object-contain max-w-[180px] mix-blend-multiply" />
                      </div>
                      <p className="text-sm md:text-base font-medium tracking-widest uppercase opacity-90">Premium Beauty Arrivals</p>
                      <Link href={`/shop?category=${brand.slug || brand.id}`} prefetch={false} className="mt-6 inline-block bg-white text-black px-8 py-3 rounded shadow-md text-xs font-bold hover:bg-[#d81b60] hover:text-white transition-all transform hover:scale-105 uppercase tracking-wide">Explore Brand</Link>
                   </div>
                </div>
                <div className="w-full lg:w-[65%] flex flex-col p-4 md:p-6 bg-[#faf6f0] relative">
                   <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x items-stretch">
                      {displayProducts.slice(0, 10).map((prod, pIdx) => {
                         const imgUrl = getProductImage(prod);
                         const currentPrice = prod.sale_price || prod.price || "0";
                         const originalPrice = prod.regular_price || (Number(currentPrice) * 1.25).toFixed(2);
                         const safeSlug = prod.slug || prod.id;

                         return (
                           <div key={`p1-${brand.id}-${prod.id}-${pIdx}`} className="min-w-[160px] md:min-w-[220px] max-w-[240px] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col snap-start group hover:shadow-lg transition-shadow">
                              
                              {/* FIX: Link aur Button ko alag kiya hai yahan */}
                              <div className="relative h-40 md:h-52 p-4 bg-white rounded-t-lg">
                                 <Link href={`/shop/${safeSlug}`} prefetch={false} className="absolute inset-0 z-10" />
                                 <img src={imgUrl} alt={prod.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 relative z-0 pointer-events-none" />
                                 <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem({ id: prod.id, name: prod.name, slug: safeSlug, price: currentPrice, quantity: 1, image: imgUrl }); }} className="bg-white p-3 rounded-full shadow-lg text-[#d81b60] hover:bg-[#d81b60] hover:text-white transition-colors pointer-events-auto">
                                      <ShoppingCart className="w-5 h-5" />
                                    </button>
                                 </div>
                              </div>

                              <div className="p-3 md:p-4 text-center border-t border-gray-100 flex-1 flex flex-col justify-between">
                                 <Link href={`/shop/${safeSlug}`} prefetch={false}><h4 className="text-[11px] md:text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#d81b60] transition-colors">{prod.name}</h4></Link>
                                 <div className={`mt-auto ${style.bg} text-white py-2 px-2 rounded flex items-center justify-center gap-2`}>
                                    <span className="text-[10px] md:text-xs line-through opacity-70">₹{Number(originalPrice).toLocaleString()}</span>
                                    <span className="text-xs md:text-sm font-bold">₹{Number(currentPrice).toLocaleString()}</span>
                                 </div>
                              </div>
                           </div>
                         )
                      })}
                   </div>
                   <div className="mt-auto pt-4 border-t-[3px] border-dotted border-gray-300">
                      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                         {displayProducts.map((prod, tIdx) => (
                           <Link key={`thumb1-${brand.id}-${prod.id}-${tIdx}`} href={`/shop/${prod.slug || prod.id}`} prefetch={false} className="min-w-[60px] w-[60px] h-[60px] md:min-w-[80px] md:w-[80px] md:h-[80px] bg-white border border-gray-200 rounded-md p-1.5 flex-shrink-0 hover:border-[#8e24aa] hover:shadow-md transition-all">
                             <img src={getProductImage(prod)} alt={prod.name} className="w-full h-full object-contain" />
                           </Link>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
           );
        })}
      </section>

      {/* --- GRID 2: Middle --- */}
      {renderProductGrid("Luxury Perfumes & Serums", getSafeItems(products, 10, 10), "bg-[#111827]", "bg-[#f1f5f9]")}

      {/* --- NEW UI SECTION 1: EDITOR'S SPOTLIGHT --- */}
      {!loadingProducts && products.length > 0 && (
        <section className="py-16 bg-[#fff0f5]">
           <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2">
                       <Star className="text-pink-500 fill-current w-8 h-8" /> Editor's <span className="text-pink-500">Spotlight</span>
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Curated must-haves of the week.</p>
                 </div>
                 <Link href="/shop" prefetch={false} className="hidden md:inline-block border-b-2 border-gray-900 text-gray-900 font-bold hover:text-pink-600 hover:border-pink-600 transition-colors">View All Picks</Link>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                 <div className="w-full lg:w-1/2">
                    {getSafeItems(products, 30, 1).map((prod, idx) => {
                       const imgUrl = getProductImage(prod);
                       const currentPrice = prod.sale_price || prod.price || "0";
                       const safeSlug = prod.slug || prod.id;

                       return (
                          <div key={`hero-${prod.id}-${idx}`} className="bg-white rounded-2xl shadow-xl overflow-hidden group h-full flex flex-col relative">
                             <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-md uppercase tracking-wider">Top Pick</div>
                             <Link href={`/shop/${safeSlug}`} prefetch={false} className="relative h-72 md:h-[450px] w-full p-8 flex items-center justify-center bg-gray-50 flex-shrink-0">
                                <img src={imgUrl} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700" />
                             </Link>
                             <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                                <div>
                                   <Link href={`/shop/${safeSlug}`} prefetch={false}><h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">{prod.name}</h3></Link>
                                   <p className="text-gray-500 text-sm mb-6 line-clamp-2" dangerouslySetInnerHTML={{ __html: prod.short_description || "Experience premium quality and flawless finish with our top editor's choice." }} />
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                   <span className="text-3xl font-black text-gray-900">₹{Number(currentPrice).toLocaleString()}</span>
                                   <button onClick={(e) => { e.preventDefault(); addItem({ id: prod.id, name: prod.name, slug: safeSlug, price: currentPrice, quantity: 1, image: imgUrl }); }} className="bg-gray-900 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-pink-600 transition-colors shadow-lg flex items-center gap-2">
                                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                                   </button>
                                </div>
                             </div>
                          </div>
                       )
                    })}
                 </div>

                 <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
                    {getSafeItems(products, 31, 4).map((prod, idx) => {
                       const imgUrl = getProductImage(prod);
                       const currentPrice = prod.sale_price || prod.price || "0";
                       const safeSlug = prod.slug || prod.id;

                       return (
                          <div key={`sub-${prod.id}-${idx}`} className="bg-white rounded-xl shadow-md overflow-hidden group flex flex-col border border-pink-100 hover:border-pink-300 transition-colors">
                             <Link href={`/shop/${safeSlug}`} prefetch={false} className="h-40 md:h-48 w-full p-4 flex items-center justify-center bg-white flex-shrink-0 relative">
                                <img src={imgUrl} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                             </Link>
                             <div className="p-4 flex flex-col justify-between flex-1 border-t border-gray-50">
                                <Link href={`/shop/${safeSlug}`} prefetch={false}><h4 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-pink-600">{prod.name}</h4></Link>
                                <div className="flex items-center justify-between mt-auto">
                                   <span className="text-sm md:text-base font-bold text-gray-900">₹{Number(currentPrice).toLocaleString()}</span>
                                   <button onClick={(e) => { e.preventDefault(); addItem({ id: prod.id, name: prod.name, slug: safeSlug, price: currentPrice, quantity: 1, image: imgUrl }); }} className="text-pink-600 hover:text-white hover:bg-pink-600 p-2 rounded-full transition-colors bg-pink-50">
                                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                                   </button>
                                </div>
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* --- EXCLUSIVE BRANDS PART 2 --- */}
      <section className="py-12 bg-white max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col gap-12">
        {categories.slice(4, 10).map((brand, index) => {
           if (loadingProducts) return null;
           let brandSpecificProducts = products.filter(p => p.categories?.some((c: any) => c.id === brand.id || c.slug === brand.slug));
           let displayProducts = brandSpecificProducts.length > 0 ? getSafeItems(brandSpecificProducts, 0, 15) : getSafeItems(products, (index + 4) * 5, 15);
           const style = BANNER_STYLES[(index + 4) % BANNER_STYLES.length];

           return (
             <div key={`showcase-2-${brand.id}`} className={`w-full flex flex-col lg:flex-row border-[3px] ${style.border} bg-[#fcf8f2] rounded-md overflow-hidden shadow-lg`}>
                <div className={`w-full lg:w-[35%] relative flex flex-col justify-center items-center p-8 text-center min-h-[300px] lg:min-h-[450px] ${style.bg} ${style.text}`}>
                   <div className="relative z-10">
                      <h3 className={`text-xl md:text-2xl font-light tracking-widest ${style.accent} mb-4 uppercase`}>{style.label} <span className="font-bold">{brand.name.split(' ')[0]}</span></h3>
                      <div className="bg-white/90 p-4 rounded-xl shadow-lg mb-6 inline-block min-w-[150px]">
                        <img src={getCategoryImage(brand)} alt={brand.name} className="h-16 md:h-24 w-full object-contain max-w-[180px] mix-blend-multiply" />
                      </div>
                      <p className="text-sm md:text-base font-medium tracking-widest uppercase opacity-90">Premium Beauty Arrivals</p>
                      <Link href={`/shop?category=${brand.slug || brand.id}`} prefetch={false} className="mt-6 inline-block bg-white text-black px-8 py-3 rounded shadow-md text-xs font-bold hover:bg-[#d81b60] hover:text-white transition-all transform hover:scale-105 uppercase tracking-wide">Explore Brand</Link>
                   </div>
                </div>
                <div className="w-full lg:w-[65%] flex flex-col p-4 md:p-6 bg-[#faf6f0] relative">
                   <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x items-stretch">
                      {displayProducts.slice(0, 10).map((prod, pIdx) => {
                         const imgUrl = getProductImage(prod);
                         const currentPrice = prod.sale_price || prod.price || "0";
                         const originalPrice = prod.regular_price || (Number(currentPrice) * 1.25).toFixed(2);
                         const safeSlug = prod.slug || prod.id;

                         return (
                           <div key={`p2-${brand.id}-${prod.id}-${pIdx}`} className="min-w-[160px] md:min-w-[220px] max-w-[240px] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col snap-start group hover:shadow-lg transition-shadow">
                              
                              {/* FIX: Link aur Button ko alag kiya hai yahan */}
                              <div className="relative h-40 md:h-52 p-4 bg-white rounded-t-lg">
                                 <Link href={`/shop/${safeSlug}`} prefetch={false} className="absolute inset-0 z-10" />
                                 <img src={imgUrl} alt={prod.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 relative z-0 pointer-events-none" />
                                 <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem({ id: prod.id, name: prod.name, slug: safeSlug, price: currentPrice, quantity: 1, image: imgUrl }); }} className="bg-white p-3 rounded-full shadow-lg text-[#d81b60] hover:bg-[#d81b60] hover:text-white transition-colors pointer-events-auto">
                                      <ShoppingCart className="w-5 h-5" />
                                    </button>
                                 </div>
                              </div>

                              <div className="p-3 md:p-4 text-center border-t border-gray-100 flex-1 flex flex-col justify-between">
                                 <Link href={`/shop/${safeSlug}`} prefetch={false}><h4 className="text-[11px] md:text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#d81b60] transition-colors">{prod.name}</h4></Link>
                                 <div className={`mt-auto ${style.bg} text-white py-2 px-2 rounded flex items-center justify-center gap-2`}>
                                    <span className="text-[10px] md:text-xs line-through opacity-70">₹{Number(originalPrice).toLocaleString()}</span>
                                    <span className="text-xs md:text-sm font-bold">₹{Number(currentPrice).toLocaleString()}</span>
                                 </div>
                              </div>
                           </div>
                         )
                      })}
                   </div>
                   <div className="mt-auto pt-4 border-t-[3px] border-dotted border-gray-300">
                      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                         {displayProducts.map((prod, tIdx) => (
                           <Link key={`thumb2-${brand.id}-${prod.id}-${tIdx}`} href={`/shop/${prod.slug || prod.id}`} prefetch={false} className="min-w-[60px] w-[60px] h-[60px] md:min-w-[80px] md:w-[80px] md:h-[80px] bg-white border border-gray-200 rounded-md p-1.5 flex-shrink-0 hover:border-[#8e24aa] hover:shadow-md transition-all">
                             <img src={getProductImage(prod)} alt={prod.name} className="w-full h-full object-contain" />
                           </Link>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
           );
        })}
      </section>

      {/* --- GRID 3: After the Exclusive Section --- */}
      {renderProductGrid("Premium Beauty Arrivals", getSafeItems(products, 20, 10), "bg-[#be123c]", "bg-[#ffe4e6]")}

      {/* --- NEW UI SECTION 2: ELEGANT FLASH SALE GRID --- */}
      {!loadingProducts && products.length > 0 && (
        <section className="py-16 bg-[#fdfbf7] border-y border-gray-200">
           <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                 <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 uppercase tracking-widest flex items-center justify-center gap-3">
                    <Zap className="text-amber-500 fill-current w-8 h-8 md:w-10 md:h-10" />
                    Flash <span className="text-amber-500 font-light">Sale</span>
                 </h2>
                 <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-px bg-gray-300 w-16"></div>
                    <div className="h-1.5 w-1.5 bg-amber-500 rounded-full"></div>
                    <div className="h-px bg-gray-300 w-16"></div>
                 </div>
                 <p className="text-gray-500 mt-4 text-xs md:text-sm tracking-[0.2em] uppercase font-semibold">Limited Time • Exclusive Elegance</p>
              </div>

              <div className="
                  grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 
                  md:flex md:flex-row md:max-h-none md:overflow-y-visible md:overflow-x-auto md:pb-6 md:pr-0 md:snap-x md:items-stretch
              ">
                 {getSafeItems(products, 40, 12).map((prod, idx) => { 
                    const imgUrl = getProductImage(prod);
                    const currentPrice = prod.sale_price || prod.price || "0";
                    const originalPrice = prod.regular_price || (Number(currentPrice) * 1.5).toFixed(2); 
                    const safeSlug = prod.slug || prod.id;
                    
                    return (
                       <div key={`flash-${prod.id}-${idx}`} className="w-full md:w-[320px] md:min-w-[320px] md:flex-shrink-0 md:snap-start bg-white rounded-none border border-gray-100 p-4 md:p-6 hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                          <div className="absolute top-4 left-4 bg-black text-white font-bold text-[9px] md:text-xs px-3 py-1.5 shadow-sm z-20 uppercase tracking-widest">
                             Limited
                          </div>

                          <Link href={`/shop/${safeSlug}`} prefetch={false} className="bg-transparent h-40 sm:h-48 md:h-64 p-2 md:p-4 flex items-center justify-center mb-4 md:mb-6 relative overflow-hidden flex-shrink-0">
                             <img src={imgUrl} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700" />
                          </Link>

                          <div className="flex-1 flex flex-col text-center">
                             <Link href={`/shop/${safeSlug}`} prefetch={false}>
                                <h4 className="text-[11px] sm:text-xs md:text-base font-semibold text-gray-800 line-clamp-2 mb-3 group-hover:text-amber-600 transition-colors">{prod.name}</h4>
                             </Link>
                             
                             <div className="mt-auto flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                   <span className="text-[10px] md:text-sm text-gray-400 line-through">₹{Number(originalPrice).toLocaleString()}</span>
                                   <span className="text-sm sm:text-lg md:text-2xl font-black text-gray-900">₹{Number(currentPrice).toLocaleString()}</span>
                                </div>
                                <button onClick={(e) => { e.preventDefault(); addItem({ id: prod.id, name: prod.name, slug: safeSlug, price: currentPrice, quantity: 1, image: imgUrl }); }} className="w-full bg-transparent border-2 border-black text-black py-2 md:py-3 text-[10px] md:text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                                   Add to Bag
                                </button>
                             </div>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>
        </section>
      )}

      {/* 5. Tabs (Best Selling / Recently Viewed) */}
      <section className="bg-white border-t-2 border-gray-100 pt-10 pb-12 mb-10">
         <div className="max-w-md mx-auto flex justify-center divide-x-2 divide-gray-200">
            <button className="px-6 md:px-8 text-center group cursor-pointer focus:outline-none">
               <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Most Loved</span>
               <span className="text-xl md:text-3xl font-extrabold text-gray-900 group-hover:text-[#d81b60] transition-colors">
                  Best <span className="text-pink-400 font-light">Selling</span>
               </span>
            </button>
            <button className="px-6 md:px-8 text-center group cursor-pointer focus:outline-none">
               <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Your History</span>
               <span className="text-xl md:text-3xl font-extrabold text-gray-900 group-hover:text-[#d81b60] transition-colors">
                  Recently <span className="text-pink-400 font-light">Viewed</span>
               </span>
            </button>
         </div>
      </section>

      {/* Tailwind Utility Override for Scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        /* Thin Elegant Custom Vertical Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #fdfbf7;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
      `}} />

    </div>
  );
}