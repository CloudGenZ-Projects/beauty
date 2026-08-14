"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  Loader2,
  ArrowLeft,
  ShoppingBag,
  Heart,
  Search,
  SlidersHorizontal,
  Check,
  PackageX,
  Sparkles,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  on_sale: boolean;
  images: { src: string }[];
  categories?: { name: string }[];
}

interface BrandDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string;
}

export default function SingleBrandPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const cartContext = useCart() as any;
  const wishlistContext = useWishlist() as any;

  const wishlist = wishlistContext?.wishlist || wishlistContext?.items || [];

  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "low-high" | "high-low">("default");
  const [addedItems, setAddedItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!slug) return;

    async function fetchBrandAndProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/brands/₹{slug}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setBrand(data.brand);
          setProducts(data.products || []);
          setOtherProducts(data.otherProducts || []);
        }
      } catch (err) {
        console.error("Error loading brand details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBrandAndProducts();
  }, [slug]);

  const isInWishlist = (productId: number) => {
    return Array.isArray(wishlist) && wishlist.some((item: any) => item.id === productId);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof wishlistContext?.toggleWishlist === "function") {
      wishlistContext.toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.src || "/placeholder.png",
        slug: product.slug,
      });
    } else if (isInWishlist(product.id)) {
      if (typeof wishlistContext?.removeFromWishlist === "function") {
        wishlistContext.removeFromWishlist(product.id);
      }
    } else {
      if (typeof wishlistContext?.addToWishlist === "function") {
        wishlistContext.addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0]?.src || "/placeholder.png",
          slug: product.slug,
        });
      }
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const addToCartFn =
      cartContext?.addItem || cartContext?.addToCart || cartContext?.addItemToCart;

    if (typeof addToCartFn === "function") {
      addToCartFn(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image: product.images[0]?.src || "/placeholder.png",
          quantity: 1,
        },
        1
      );
    }

    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 3000);
  };

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchFilter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "low-high") return Number(a.price) - Number(b.price);
      if (sortBy === "high-low") return Number(b.price) - Number(a.price);
      return 0;
    });

  const renderProductCard = (product: Product) => {
    const discount =
      product.on_sale && Number(product.regular_price) > Number(product.price)
        ? Math.round(
            ((Number(product.regular_price) - Number(product.price)) /
              Number(product.regular_price)) *
              100
          )
        : 0;

    return (
      <div
        key={product.id}
        className="group bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 hover:border-pink-200 transition-all hover:shadow-xl flex flex-col relative"
      >
        <div className="absolute top-5 left-5 z-10 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-[#d81b60] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        <button
          onClick={(e) => handleWishlistToggle(e, product)}
          className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 text-gray-400 hover:text-[#d81b60] transition-colors"
        >
          <Heart
            className={`w-4 h-4 ₹{
              isInWishlist(product.id) ? "fill-[#d81b60] text-[#d81b60]" : ""
            }`}
          />
        </button>

        <Link href={`/shop/₹{product.slug}`} className="block mb-3">
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden p-3 flex items-center justify-center relative">
            <img
              src={product.images[0]?.src || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        <div className="flex flex-col flex-1">
          <Link href={`/shop/₹{product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#d81b60] transition-colors mb-2 min-h-[36px]">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-auto mb-3">
            <span className="text-sm sm:text-base font-black text-gray-900">
              ₹{Number(product.price).toLocaleString()}
            </span>
            {product.on_sale && Number(product.regular_price) > Number(product.price) && (
              <span className="text-xs text-gray-400 line-through font-semibold">
                ₹{Number(product.regular_price).toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={(e) => handleAddToCart(e, product)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm ₹{
              addedItems[product.id]
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-900 hover:bg-[#d81b60] text-white"
            }`}
          >
            {addedItems[product.id] ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added! Add More
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#d81b60] animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Fetching Brand Catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <Link
          href="/brands"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#d81b60] uppercase tracking-wider mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Brands
        </Link>

        {/* Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 mb-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col text-center md:text-left min-w-0 flex-1 z-10">
            <span className="text-[10px] font-bold text-[#d81b60] uppercase tracking-[0.2em] mb-1">
              Official Brand Store
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase mb-3">
              {brand?.name || slug?.replace("-", " ")}
            </h1>
            {brand?.description && (
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl line-clamp-2 font-medium">
                {brand.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
              <span className="bg-pink-50 text-[#d81b60] text-xs font-black px-3.5 py-1.5 rounded-full border border-pink-100 uppercase tracking-wider">
                {products.length} Products Available
              </span>
            </div>
          </div>

          {brand?.logo && (
            <div className="w-40 h-28 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-center shadow-inner flex-shrink-0 z-10">
              <img
                src={brand.logo}
                alt={brand.name || "Brand"}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Filter Strip - Show only if products exist for this brand */}
        {products.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Search in ₹{brand?.name || "brand"}...`}
                className="w-full bg-gray-50 border border-transparent focus:border-[#d81b60] focus:bg-white rounded-xl py-2 pl-10 pr-4 text-xs font-medium outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="default">Sort by: Featured</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}

        {/* CONDITION 1: Brand Has Products */}
        {products.length > 0 ? (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((p) => renderProductCard(p))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
              <p className="text-sm font-bold text-gray-700 mb-2">No matching items found</p>
              <button
                onClick={() => setSearchFilter("")}
                className="text-xs font-bold text-[#d81b60] uppercase tracking-wider hover:underline"
              >
                Reset Filter
              </button>
            </div>
          )
        ) : (
          /* CONDITION 2: Brand Has 0 Products -> Show Banner + Other Products */
          <div className="flex flex-col gap-12">
            {/* Empty State Banner */}
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto w-full flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-50 text-[#d81b60] rounded-full flex items-center justify-center mb-4 border border-pink-100">
                <PackageX className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
                No Products Available
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-6 max-w-md leading-relaxed">
                Currently there are no products listed under{" "}
                <span className="font-black text-gray-800">{brand?.name || "this brand"}</span>.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#d81b60] transition-all shadow-md hover:shadow-lg"
              >
                Browse All Shop Products
              </Link>
            </div>

            {/* Other Products Section */}
            {otherProducts.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                  <Sparkles className="w-5 h-5 text-[#d81b60]" />
                  <h2 className="text-lg font-black uppercase text-gray-900 tracking-tight">
                    Other Products You Might Like
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {otherProducts.map((p) => renderProductCard(p))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}