"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Heart,
  Loader2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Gift,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MegaMenu, { MegaMenuCategories, MegaMenuBrands } from "./MegaMenu";

const POPULAR_SEARCHES = ["Serum", "Lipstick", "Sunscreen", "Vitamin C", "Foundation", "Perfume"];

interface SuggestionProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  on_sale: boolean;
  image: string;
  category: string;
}

// -----------------------------------------------------------------
// Helper Component: Syncs URL search query with state
// -----------------------------------------------------------------
function SearchParamsSync({ setSearchQuery }: { setSearchQuery: (q: string) => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const currentQ = searchParams.get("q");
    if (currentQ) {
      setSearchQuery(currentQ);
    } else {
      setSearchQuery("");
    }
  }, [pathname, searchParams, setSearchQuery]);

  return null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  // Navigation Mobile Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Search Focus & Mobile Expand States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  // Expanded Accordions for Mobile Drawer
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [mobileBrandTab, setMobileBrandTab] = useState<"popular" | "luxe">("popular");

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const mobileSearchBarRef = useRef<HTMLDivElement>(null);

  // Dynamic Mega Menu States
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [menuCategories, setMenuCategories] = useState<MegaMenuCategories>({});
  const [menuBrands, setMenuBrands] = useState<MegaMenuBrands>({ popular: [], luxe: [] });

  // Fetch Dynamic Mega Menu Data from WooCommerce API
  useEffect(() => {
    async function loadMegaMenu() {
      try {
        const res = await fetch("/api/megamenu");
        if (res.ok) {
          const data = await res.json();
          if (data.categories) setMenuCategories(data.categories);
          if (data.brands) setMenuBrands(data.brands);
        }
      } catch (err) {
        console.error("Failed to load mega menu:", err);
      }
    }
    loadMegaMenu();
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileDrawerOpen]);

  // Reset states on page navigation
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsSearchFocused(false);
    setIsMobileSearchExpanded(false);
    setActiveMegaMenu(null);
  }, [pathname]);

  // Click outside search container to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target as Node) &&
        mobileSearchBarRef.current &&
        !mobileSearchBarRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search API Fetcher
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Error fetching live suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery !== undefined ? customQuery : searchQuery;

    if (queryToUse.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryToUse.trim())}`);
      setIsSearchFocused(false);
      setIsMobileSearchExpanded(false);
    }
  };

  const toggleMobileCategory = (catKey: string) => {
    setExpandedMobileCategory(expandedMobileCategory === catKey ? null : catKey);
  };

  // Generate Navigation Items
  const categoryKeys = Object.keys(menuCategories);
  const categoryNavItems = categoryKeys.map((catName) => ({
    name: catName.toUpperCase(),
    hasMegaMenu: true,
    id: catName,
    href: `/shop?category=${encodeURIComponent(catName.toLowerCase())}`,
  }));

  const DESKTOP_NAV_ITEMS = [
    ...(categoryNavItems.length > 0
      ? categoryNavItems
      : [
          { name: "MAKEUP", hasMegaMenu: true, id: "Makeup", href: "/shop?category=makeup" },
          { name: "SKIN", hasMegaMenu: true, id: "Skin", href: "/shop?category=skin" },
          { name: "HAIR", hasMegaMenu: true, id: "Hair", href: "/shop?category=hair" },
        ]),
    { name: "BRANDS", hasMegaMenu: true, id: "brands", href: "/brands" },
    { name: "LUXE", hasMegaMenu: false, id: "luxe", href: "/shop?category=luxe" },
    { name: "OFFERS", hasMegaMenu: false, id: "offers", href: "/offers" },
  ];

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync setSearchQuery={setSearchQuery} />
      </Suspense>

      <header
        className="sticky top-0 w-full bg-white z-40 border-b border-gray-100 shadow-sm"
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        {/* ================================================================= */}
        {/* MAIN HEADER STRIP (Mobile / Tablet / Desktop)                      */}
        {/* ================================================================= */}
        <div className="max-w-[1600px] mx-auto w-full px-2.5 sm:px-6 md:px-8 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-1.5 sm:gap-4 bg-white relative z-50">
          
          {/* LEFT: Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-1 sm:p-2 -ml-1 text-gray-900 hover:text-[#d81b60] focus:outline-none md:hidden transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link href="/" className="flex flex-col group select-none">
              <h1 className="text-base sm:text-2xl md:text-3xl font-black text-gray-900 tracking-[0.1em] sm:tracking-[0.15em] uppercase leading-none group-hover:text-[#d81b60] transition-colors">
                GLOBE TRADING
              </h1>
              <span className="text-[6.5px] sm:text-[9px] text-gray-400 tracking-[0.2em] sm:tracking-[0.3em] uppercase mt-0.5 font-semibold">
                
              </span>
            </Link>
          </div>

          {/* =============================================================== */}
          {/* CENTER: DESKTOP & TABLET SEARCH BAR                              */}
          {/* =============================================================== */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl mx-4 lg:mx-8 relative" ref={searchBarRef}>
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="relative flex items-center w-full group"
            >
              <div className="absolute left-4 z-10 text-gray-400 group-focus-within:text-[#d81b60] transition-colors">
                <Search className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search formulas, lipsticks, skincare, perfumes..."
                className="w-full bg-gray-50/80 hover:bg-gray-100/80 focus:bg-white border border-gray-200/80 focus:border-[#d81b60] rounded-full py-2.5 lg:py-3 pl-11 pr-24 text-xs lg:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 shadow-inner focus:shadow-[0_0_20px_rgba(216,27,96,0.12)] focus:ring-2 focus:ring-pink-500/10"
              />

              <div className="absolute right-2.5 flex items-center gap-1.5 z-10">
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-[#d81b60] animate-spin mr-1" />
                )}

                {searchQuery && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-[#d81b60] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-1"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* AUTOCOMPLETE POPUP DROPDOWN (DESKTOP) */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 w-full mt-2.5 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[75vh] overflow-y-auto custom-scrollbar"
                >
                  {searchQuery.trim().length > 0 ? (
                    <div className="p-4">
                      {isLoading && suggestions.length === 0 ? (
                        <div className="py-10 text-center text-xs text-gray-400 flex items-center justify-center gap-2 font-medium">
                          <Loader2 className="w-4 h-4 animate-spin text-[#d81b60]" />
                          Searching store catalog for "{searchQuery}"...
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                            <span>Product Suggestions ({suggestions.length})</span>
                            <span className="text-[#d81b60] flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Live Results
                            </span>
                          </div>

                          <div className="flex flex-col gap-2">
                            {suggestions.map((item) => (
                              <Link
                                key={item.id}
                                href={`/shop/₹{item.slug}`}
                                onClick={() => setIsSearchFocused(false)}
                                className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-pink-50/60 transition-all group border border-transparent hover:border-pink-100/80"
                              >
                                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100 shadow-sm group-hover:border-pink-200">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                                  />
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs lg:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#d81b60] transition-colors">
                                      {item.name}
                                    </h4>
                                    {item.on_sale && (
                                      <span className="bg-red-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">
                                        SALE
                                      </span>
                                    )}
                                  </div>

                                  {item.category && (
                                    <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                                      {item.category}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs lg:text-sm font-black text-gray-900">
                                      ₹{Number(item.price).toLocaleString()}
                                    </span>
                                    {item.on_sale && Number(item.regular_price) > Number(item.price) && (
                                      <span className="text-[11px] text-gray-400 line-through">
                                        ₹{Number(item.regular_price).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#d81b60] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                              </Link>
                            ))}
                          </div>

                          <button
                            onClick={() => handleSearchSubmit()}
                            className="w-full mt-4 py-3 bg-gray-900 hover:bg-[#d81b60] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group shadow-md"
                          >
                            Explore All Results for "{searchQuery}"
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-1.5">
                          <p className="font-semibold text-gray-700">No instant matches found</p>
                          <button
                            onClick={() => handleSearchSubmit()}
                            className="text-xs font-bold text-[#d81b60] hover:underline"
                          >
                            Press Enter to search full catalog
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-[#d81b60]" />
                          Popular Searches
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSearchQuery(term);
                              handleSearchSubmit(undefined, term);
                            }}
                            className="flex items-center gap-1.5 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-[#d81b60] text-xs font-medium px-3.5 py-2 rounded-full border border-gray-100 hover:border-pink-200 transition-all cursor-pointer active:scale-95"
                          >
                            <Sparkles className="w-3 h-3 text-[#d81b60]" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =============================================================== */}
          {/* RIGHT: ALL ACTION ICONS VISIBLE ON MOBILE & DESKTOP             */}
          {/* =============================================================== */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-2.5 md:gap-3 text-gray-900">
            {/* 1. Mobile Search Toggle Button (< md) */}
            <button
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className="p-1.5 sm:p-2 md:hidden text-gray-800 hover:text-[#d81b60] transition-colors"
              aria-label="Toggle Search Bar"
            >
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {/* 2. Wishlist Icon Badge */}
            <Link
              href="/wishlist"
              className="p-1.5 sm:p-2 relative text-gray-800 hover:text-[#d81b60] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[1.6]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[#d81b60] text-white text-[8px] sm:text-[9px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* 3. Account Icon */}
            <Link
              href="/account"
              className="p-1.5 sm:p-2 text-gray-800 hover:text-[#d81b60] transition-colors"
              aria-label="Account"
            >
              <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[1.6]" />
            </Link>

            {/* 4. Cart Icon Badge */}
            <Link
              href="/cart"
              className="p-1.5 sm:p-2 relative text-gray-800 hover:text-[#d81b60] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[1.6]" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[#d81b60] text-white text-[8px] sm:text-[9px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MOBILE INTEGRATED SEARCH BAR WITH LIVE AUTOCOMPLETE RESULTS (< md) */}
        {/* ================================================================= */}
        <AnimatePresence>
          {isMobileSearchExpanded && (
            <motion.div
              ref={mobileSearchBarRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100 p-3 px-4 shadow-xl overflow-hidden relative z-40"
            >
              <form onSubmit={(e) => handleSearchSubmit(e)} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#d81b60]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lipstick, serums, fragrance..."
                  className="w-full bg-gray-100/90 border border-gray-200/80 focus:border-[#d81b60] focus:bg-white rounded-full py-2.5 pl-10 pr-20 text-xs font-medium text-gray-900 outline-none transition-all"
                  autoFocus
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#d81b60] text-white px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* LIVE MOBILE AUTOCOMPLETE POPUP (EXACTLY LIKE DESKTOP) */}
              {searchQuery.trim().length > 0 ? (
                <div className="mt-3 pt-3 border-t border-gray-100 max-h-[55vh] overflow-y-auto custom-scrollbar">
                  {isLoading && suggestions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#d81b60]" />
                      Searching catalog for "{searchQuery}"...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-gray-400 pb-1.5 border-b border-gray-100">
                        <span>Instant Products ({suggestions.length})</span>
                        <span className="text-[#d81b60] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Live Matches
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {suggestions.map((item) => (
                          <Link
                            key={item.id}
                            href={`/shop/₹{item.slug}`}
                            onClick={() => {
                              setIsMobileSearchExpanded(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/70 hover:bg-pink-50/60 border border-gray-100 active:scale-98 transition-all"
                          >
                            <div className="w-11 h-11 bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100 shadow-sm">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                                  {item.name}
                                </h4>
                                {item.on_sale && (
                                  <span className="bg-red-500 text-white text-[8px] font-black uppercase px-1 py-0.2 rounded shadow-sm">
                                    SALE
                                  </span>
                                )}
                              </div>

                              {item.category && (
                                <span className="text-[9.5px] text-gray-400 line-clamp-1 mt-0.5">
                                  {item.category}
                                </span>
                              )}

                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-black text-gray-900">
                                  ₹{Number(item.price).toLocaleString()}
                                </span>
                                {item.on_sale && Number(item.regular_price) > Number(item.price) && (
                                  <span className="text-[10px] text-gray-400 line-through">
                                    ₹{Number(item.regular_price).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </Link>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSearchSubmit()}
                        className="w-full mt-2 py-2.5 bg-gray-900 hover:bg-[#d81b60] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        Explore All Results for "{searchQuery}"
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-500 font-medium">
                      No instant matches found for "{searchQuery}".
                    </div>
                  )}
                </div>
              ) : (
                /* Popular quick tags when query is empty */
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-2.5 pb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                    Popular:
                  </span>
                  {POPULAR_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearchSubmit(undefined, term);
                      }}
                      className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full flex-shrink-0 hover:bg-pink-100 hover:text-[#d81b60]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* DESKTOP / LAPTOP NAVIGATION STRIP (md+)                           */}
        {/* ================================================================= */}
        <div className="hidden md:flex w-full bg-white border-t border-gray-100 items-center justify-center h-11 gap-4 md:gap-6 lg:gap-10 xl:gap-12 relative z-40 px-4">
          {DESKTOP_NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className="h-full flex items-center"
              onMouseEnter={() => (item.hasMegaMenu ? setActiveMegaMenu(item.id) : setActiveMegaMenu(null))}
            >
              <Link
                href={item.href}
                className={`text-[11px] lg:text-xs font-bold tracking-widest uppercase transition-colors relative group h-full flex items-center ₹{
                  activeMegaMenu === item.id ? "text-[#d81b60]" : "text-gray-700 hover:text-[#d81b60]"
                }`}
              >
                {item.name}
                {activeMegaMenu === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#d81b60] rounded-t-md"></span>
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* MEGA MENU FLYOUT */}
        <MegaMenu
          activeMegaMenu={activeMegaMenu}
          setActiveMegaMenu={setActiveMegaMenu}
          categories={menuCategories}
          brands={menuBrands}
        />
      </header>

      {/* SEARCH BACKDROP (DESKTOP) */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchFocused(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30 hidden md:block"
          />
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MOBILE FULL NAVIGATION DRAWER WITH CLEAN ACCORDIONS              */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm md:hidden"
            />

            {/* Slide Drawer Sheet */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-[300px] sm:w-[350px] bg-white z-[70] shadow-2xl flex flex-col overflow-hidden md:hidden"
            >
              {/* Drawer Top Branding */}
              <div className="bg-white border-b border-gray-100 flex items-center justify-between px-5 py-4 sticky top-0 z-10">
                <div className="flex flex-col">
                  <span className="font-black text-lg text-gray-900 tracking-widest uppercase">GLOBE TRADING</span>
                  <span className="text-[8px] text-gray-400 tracking-[0.2em] uppercase"> Catalog</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-[#d81b60] rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Shortcuts Bar */}
              <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50/60 p-2.5 gap-2 text-xs font-bold text-gray-700">
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white border border-gray-100 hover:text-[#d81b60] shadow-sm"
                >
                  <Heart className="w-4 h-4 text-[#d81b60]" />
                  Wishlist ({wishlist.length})
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white border border-gray-100 hover:text-[#d81b60] shadow-sm"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  My Account
                </Link>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                
                {/* 1. DYNAMIC CATEGORIES ACCORDION */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Departments
                  </div>

                  <div className="space-y-1.5">
                    {categoryKeys.map((catKey) => {
                      const isExpanded = expandedMobileCategory === catKey;
                      const subGroups = menuCategories[catKey] || [];

                      return (
                        <div key={catKey} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={() => toggleMobileCategory(catKey)}
                            className="w-full flex items-center justify-between p-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900 bg-gray-50/50 hover:bg-pink-50/30 transition-colors"
                          >
                            <span>{catKey}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ₹{
                                isExpanded ? "rotate-180 text-[#d81b60]" : ""
                              }`}
                            />
                          </button>

                          {/* Nested Subcategories */}
                          {isExpanded && (
                            <div className="p-3 bg-white border-t border-gray-100 space-y-3">
                              <Link
                                href={`/shop?category=${encodeURIComponent(catKey.toLowerCase())}`}
                                onClick={() => setIsMobileDrawerOpen(false)}
                                className="inline-block text-xs font-bold text-[#d81b60] hover:underline"
                              >
                                View All {catKey} &rarr;
                              </Link>

                              {subGroups.map((group, gIdx) => (
                                <div key={gIdx} className="space-y-1">
                                  <h5 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
                                    {group.title}
                                  </h5>
                                  <div className="flex flex-col gap-1 pl-2 border-l-2 border-gray-100">
                                    {group.links.map((subLink, lIdx) => (
                                      <Link
                                        key={lIdx}
                                        href={`/shop?category=${encodeURIComponent(subLink.toLowerCase())}`}
                                        onClick={() => setIsMobileDrawerOpen(false)}
                                        className="text-xs text-gray-600 hover:text-[#d81b60] py-1"
                                      >
                                        {subLink}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. BRANDS SECTION IN MOBILE DRAWER */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Featured Brands
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-lg mb-2">
                    <button
                      onClick={() => setMobileBrandTab("popular")}
                      className={`py-1.5 text-[11px] font-bold uppercase tracking-wider rounded ₹{
                        mobileBrandTab === "popular" ? "bg-white text-[#d81b60] shadow-sm" : "text-gray-600"
                      }`}
                    >
                      Popular
                    </button>
                    <button
                      onClick={() => setMobileBrandTab("luxe")}
                      className={`py-1.5 text-[11px] font-bold uppercase tracking-wider rounded ₹{
                        mobileBrandTab === "luxe" ? "bg-white text-[#d81b60] shadow-sm" : "text-gray-600"
                      }`}
                    >
                      Luxe
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(menuBrands[mobileBrandTab] || []).slice(0, 6).map((brand, bIdx) => {
                      const name = typeof brand === "string" ? brand : brand.name || brand.title || "";
                      const slug =
                        typeof brand === "string"
                          ? brand.toLowerCase().replace(/\s+/g, "-")
                          : brand.slug || name.toLowerCase().replace(/\s+/g, "-");

                      if (!name) return null;

                      return (
                        <Link
                          key={bIdx}
                          href={`/brands/₹{slug}`}
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className="p-2 border border-gray-100 rounded-lg text-center text-xs font-semibold text-gray-700 bg-white hover:border-pink-200"
                        >
                          {name}
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href="/brands"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="block text-center text-xs font-bold text-[#d81b60] mt-2 py-1"
                  >
                    View All Brands &rarr;
                  </Link>
                </div>

                {/* 3. CLEAN FEATURED LINKS (OFFERS & LUXE) */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Explore
                  </div>

                  <Link
                    href="/shop?category=luxe"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-pink-50/30 text-xs font-bold text-gray-900 uppercase tracking-wider transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#d81b60]" />
                      Luxe Collection
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/offers"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center justify-between p-3 border border-pink-100 rounded-xl bg-pink-50/30 hover:bg-pink-50/80 text-xs font-bold text-[#d81b60] uppercase tracking-wider transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#d81b60]" />
                      Special Offers & Deals
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#d81b60]" />
                  </Link>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}