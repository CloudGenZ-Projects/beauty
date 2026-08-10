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
  Heart,
  Loader2,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- DUMMY DATA FOR MEGA MENU ---
const MEGA_MENU_CATEGORIES = {
  Makeup: [
    { title: "Face", links: ["Foundation", "Concealer", "Primer", "Blush", "Highlighter"] },
    { title: "Eyes", links: ["Kajal", "Eyeliner", "Mascara", "Eyeshadow", "Eyebrow"] },
    { title: "Lips", links: ["Lipstick", "Liquid Lipstick", "Lip Balm", "Lip Gloss"] },
    { title: "Top Brands", links: ["MAC", "Maybelline", "L'Oreal Paris", "Lakme"] },
  ],
  Skin: [
    { title: "Moisturizers", links: ["Face Wash", "Cleanser", "Micellar Water", "Face Wipes"] },
    { title: "Serums & Treatments", links: ["Vitamin C", "Hyaluronic Acid", "Retinol", "Acne"] },
    { title: "Masks", links: ["Sheet Masks", "Sleeping Masks", "Face Packs"] },
    { title: "Sun Care", links: ["Face Sunscreen", "Body Sunscreen"] },
  ],
  Hair: [
    { title: "Hair Care", links: ["Shampoo", "Conditioner", "Hair Oil", "Hair Serum"] },
    { title: "Hair Styling", links: ["Hair Spray", "Hair Gel", "Hair Creams"] },
    { title: "Tools & Accessories", links: ["Hair Dryers", "Straighteners", "Curling Irons"] },
  ],
  Fragrance: [
    { title: "Women's Fragrance", links: ["Perfume", "Body Mist", "Deodorant"] },
    { title: "Men's Fragrance", links: ["Cologne", "Aftershave", "Deodorant"] },
    { title: "Premium", links: ["Chanel", "Dior", "Gucci", "Tom Ford"] },
  ],
};

const MEGA_MENU_BRANDS = {
  popular: [
    "Nykaa Cosmetics",
    "Dot & Key",
    "Kay Beauty",
    "Maybelline New York",
    "Lakme",
    "L'Oreal Paris",
    "MAC",
    "Plum",
    "Cetaphil",
    "The Ordinary",
    "Laneige",
    "Innisfree",
  ],
  luxe: ["Estee Lauder", "Bobbi Brown", "Clinique", "MAC", "Charlotte Tilbury", "Kérastase"],
};

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

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const [isOpen, setIsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState("Skin");
  const [activeBrandTab, setActiveBrandTab] = useState("popular");

  // Sync search input with URL params
  useEffect(() => {
    setIsOpen(false);
    setIsSearchFocused(false);
    setActiveMegaMenu(null);

    const currentQ = searchParams.get("q");
    if (currentQ) {
      setSearchQuery(currentQ);
    } else {
      setSearchQuery("");
    }
  }, [pathname, searchParams]);

  // Click outside search container to dismiss popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Live Search Fetching
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

  // Submit search page
  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery !== undefined ? customQuery : searchQuery;

    if (queryToUse.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryToUse.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const DESKTOP_NAV_ITEMS = [
    { name: "CATEGORIES", hasMegaMenu: true, id: "categories", href: "/shop" },
    { name: "BRANDS", hasMegaMenu: true, id: "brands", href: "/brands" },
    { name: "LUXE", hasMegaMenu: false, id: "luxe", href: "/shop?category=luxe" },
    { name: "OFFERS", hasMegaMenu: false, id: "offers", href: "/offers" },
  ];

  return (
    <>
      <header
        className="sticky top-0 w-full bg-white z-50 border-b border-gray-200 shadow-sm"
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        {/* --- MAIN HEADER STRIP --- */}
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4 bg-white relative z-50">
          {/* Left: Mobile Toggle / Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 text-gray-900 focus:outline-none md:hidden"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex flex-col group">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-[0.15em] uppercase leading-none group-hover:text-[#d81b60] transition-colors">
                VÉLOURS
              </h1>
              <span className="text-[8px] sm:text-[9px] text-gray-400 tracking-[0.3em] uppercase mt-0.5 font-semibold">
                Atelier
              </span>
            </Link>
          </div>

          {/* Center: Embedded Live Search Bar */}
          <div className="flex-1 max-w-2xl mx-2 md:mx-6 relative" ref={searchBarRef}>
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="relative flex items-center w-full"
            >
              <Search className="absolute left-3.5 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search for beauty, makeup, perfumes, brands..."
                className="w-full bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-[#d81b60] rounded-full py-2.5 md:py-3 pl-10 md:pl-11 pr-20 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(216,27,96,0.1)]"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                {isLoading && <Loader2 className="w-4 h-4 text-[#d81b60] animate-spin" />}
                {searchQuery && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-[#d81b60] text-white p-2 md:px-4 md:py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5 md:hidden" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </form>

            {/* --- AUTOCOMPLETE DROPDOWN POPOVER --- */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[80vh] overflow-y-auto custom-scrollbar"
                >
                  {/* CASE 1: Query Typed & Results Loading/Available */}
                  {searchQuery.trim().length > 0 ? (
                    <div className="p-3 sm:p-4">
                      {isLoading && suggestions.length === 0 ? (
                        <div className="py-8 text-center text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-2 font-medium">
                          <Loader2 className="w-4 h-4 animate-spin text-[#d81b60]" />
                          Searching catalog for "{searchQuery}"...
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            <span>Products ({suggestions.length})</span>
                            <span className="text-[#d81b60]">Instant Matches</span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {suggestions.map((item) => (
                              <Link
                                key={item.id}
                                href={`/shop/${item.slug}`}
                                onClick={() => setIsSearchFocused(false)}
                                className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-pink-50/80 transition-all group border border-transparent hover:border-pink-100 relative"
                              >
                                {/* Thumbnail Image */}
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100 relative">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                                  />
                                </div>

                                {/* Product Info */}
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#d81b60] transition-colors">
                                      {item.name}
                                    </h4>
                                    {item.on_sale && (
                                      <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                        Sale
                                      </span>
                                    )}
                                  </div>

                                  {item.category && (
                                    <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                                      {item.category}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs sm:text-sm font-black text-gray-900">
                                      ₹{Number(item.price).toLocaleString()}
                                    </span>
                                    {item.on_sale && Number(item.regular_price) > Number(item.price) && (
                                      <span className="text-[10px] sm:text-xs text-gray-400 line-through font-semibold">
                                        ₹{Number(item.regular_price).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#d81b60] transition-colors flex-shrink-0" />
                              </Link>
                            ))}
                          </div>

                          <button
                            onClick={() => handleSearchSubmit()}
                            className="w-full mt-3 py-2.5 bg-gray-900 hover:bg-[#d81b60] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group shadow-sm"
                          >
                            View All Results for "{searchQuery}"
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs sm:text-sm text-gray-500 flex flex-col items-center justify-center gap-1.5">
                          <p className="font-semibold text-gray-700">No instant matches found</p>
                          <button
                            onClick={() => handleSearchSubmit()}
                            className="text-xs font-bold text-[#d81b60] hover:underline"
                          >
                            Press Enter to search full store
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CASE 2: Search empty -> Popular Searches */
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        <TrendingUp className="w-3.5 h-3.5 text-[#d81b60]" />
                        Popular Searches
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSearchQuery(term);
                              handleSearchSubmit(undefined, term);
                            }}
                            className="flex items-center gap-1.5 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-[#d81b60] text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-100 hover:border-pink-200 transition-all cursor-pointer"
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

          {/* Right: User Actions */}
          <div className="flex items-center justify-end gap-3 sm:gap-5 text-gray-900">
            <Link href="/wishlist" className="relative hover:text-[#d81b60] transition-colors hidden sm:block">
              <Heart className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#d81b60] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link href="/account" className="hover:text-[#d81b60] transition-colors hidden sm:block">
              <User className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </Link>

            <Link href="/cart" className="relative hover:text-[#d81b60] transition-colors">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#d81b60] text-[#fff] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* --- DESKTOP NAVIGATION STRIP --- */}
        <div className="hidden md:flex w-full bg-white border-t border-gray-100 items-center justify-center h-11 gap-8 lg:gap-12 relative z-40">
          {DESKTOP_NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className="h-full flex items-center"
              onMouseEnter={() => (item.hasMegaMenu ? setActiveMegaMenu(item.id) : setActiveMegaMenu(null))}
            >
              <Link
                href={item.href}
                className={`text-[11px] lg:text-xs font-bold tracking-widest uppercase transition-colors relative group h-full flex items-center ${
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

        {/* --- MEGA MENU DROPDOWNS --- */}
        <AnimatePresence>
          {activeMegaMenu === "categories" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 z-30 hidden md:block"
            >
              <div className="max-w-[1400px] mx-auto flex h-[420px]">
                <div className="w-[20%] bg-gray-50 border-r border-gray-100 py-4 flex flex-col">
                  {Object.keys(MEGA_MENU_CATEGORIES).map((cat) => (
                    <button
                      key={cat}
                      onMouseEnter={() => setActiveCategoryTab(cat)}
                      className={`text-left px-6 py-3 text-[13px] font-semibold transition-colors flex justify-between items-center ${
                        activeCategoryTab === cat
                          ? "bg-white text-[#d81b60] border-l-4 border-[#d81b60]"
                          : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
                      }`}
                    >
                      {cat}
                      {activeCategoryTab === cat && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                <div className="w-[80%] bg-white p-8 grid grid-cols-4 gap-8 overflow-y-auto">
                  {MEGA_MENU_CATEGORIES[activeCategoryTab as keyof typeof MEGA_MENU_CATEGORIES].map((col, idx) => (
                    <div key={idx} className="flex flex-col">
                      <h3 className="font-bold text-gray-900 text-[13px] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        {col.title}
                      </h3>
                      <div className="flex flex-col gap-2.5">
                        {col.links.map((link, lIdx) => (
                          <Link
                            key={lIdx}
                            href={`/shop?category=${link.toLowerCase()}`}
                            className="text-gray-500 hover:text-[#d81b60] text-[13px] transition-colors hover:translate-x-1 duration-200"
                            onClick={() => setActiveMegaMenu(null)}
                          >
                            {link}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeMegaMenu === "brands" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 z-30 hidden md:block"
            >
              <div className="max-w-[1400px] mx-auto flex h-[420px]">
                <div className="w-[25%] bg-white border-r border-gray-100 p-6 flex flex-col h-full">
                  <h3 className="font-bold text-gray-900 text-xs tracking-wider uppercase mb-4">Top Brands</h3>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                    {MEGA_MENU_BRANDS.popular.map((brand, i) => (
                      <Link
                        key={i}
                        href={`/brands/${brand.toLowerCase()}`}
                        className="text-[13px] text-gray-600 hover:text-[#d81b60]"
                        onClick={() => setActiveMegaMenu(null)}
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="w-[75%] bg-gray-50/50 p-8 flex flex-col">
                  <div className="flex gap-4 mb-6">
                    <button
                      onMouseEnter={() => setActiveBrandTab("popular")}
                      className={`px-8 py-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors ${
                        activeBrandTab === "popular"
                          ? "bg-[#d81b60] text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      Popular
                    </button>
                    <button
                      onMouseEnter={() => setActiveBrandTab("luxe")}
                      className={`px-8 py-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors ${
                        activeBrandTab === "luxe"
                          ? "bg-[#d81b60] text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      Luxe
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {MEGA_MENU_BRANDS[activeBrandTab as keyof typeof MEGA_MENU_BRANDS].map((brand, idx) => (
                      <Link
                        key={idx}
                        href={`/brands/${brand.toLowerCase()}`}
                        onClick={() => setActiveMegaMenu(null)}
                        className="bg-white border border-gray-100 hover:border-pink-200 rounded-lg p-4 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-all h-16 group"
                      >
                        <span className="text-xs font-bold text-gray-700 group-hover:text-[#d81b60]">{brand}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- DIMMED BACKDROP WHILE SEARCH IS FOCUSED --- */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchFocused(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30"
          />
        )}
      </AnimatePresence>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-[300px] sm:w-[350px] bg-white z-[70] shadow-2xl flex flex-col overflow-y-auto md:hidden"
            >
              <div className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-5 sticky top-0 z-10">
                <div className="flex flex-col">
                  <span className="font-black text-lg text-gray-900 tracking-widest uppercase">VÉLOURS</span>
                  <span className="text-[8px] text-gray-400 tracking-[0.2em] uppercase">Atelier</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-[#d81b60]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col py-2">
                {DESKTOP_NAV_ITEMS.map((link) => (
                  <Link
                    key={`mob-${link.name}`}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-4 text-sm text-gray-800 font-bold hover:bg-gray-50 hover:text-[#d81b60] flex items-center justify-between group border-b border-gray-50 uppercase tracking-wider"
                  >
                    {link.name}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#d81b60]" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 w-full bg-white z-50 border-b border-gray-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4 bg-white" />
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}