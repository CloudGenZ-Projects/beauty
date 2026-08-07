"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ShoppingBag, Search, User, Menu, X, ChevronRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- DUMMY DATA FOR MEGA MENU (Nykaa Style) ---
const MEGA_MENU_CATEGORIES = {
  "Makeup": [
    { title: "Face", links: ["Foundation", "Concealer", "Primer", "Blush", "Highlighter"] },
    { title: "Eyes", links: ["Kajal", "Eyeliner", "Mascara", "Eyeshadow", "Eyebrow"] },
    { title: "Lips", links: ["Lipstick", "Liquid Lipstick", "Lip Balm", "Lip Gloss"] },
    { title: "Top Brands", links: ["MAC", "Maybelline", "L'Oreal Paris", "Lakme"] },
  ],
  "Skin": [
    { title: "Moisturizers", links: ["Face Wash", "Cleanser", "Micellar Water", "Face Wipes"] },
    { title: "Serums & Treatments", links: ["Vitamin C", "Hyaluronic Acid", "Retinol", "Acne"] },
    { title: "Masks", links: ["Sheet Masks", "Sleeping Masks", "Face Packs"] },
    { title: "Sun Care", links: ["Face Sunscreen", "Body Sunscreen"] },
  ],
  "Hair": [
    { title: "Hair Care", links: ["Shampoo", "Conditioner", "Hair Oil", "Hair Serum"] },
    { title: "Hair Styling", links: ["Hair Spray", "Hair Gel", "Hair Creams"] },
    { title: "Tools & Accessories", links: ["Hair Dryers", "Straighteners", "Curling Irons"] },
  ],
  "Fragrance": [
    { title: "Women's Fragrance", links: ["Perfume", "Body Mist", "Deodorant"] },
    { title: "Men's Fragrance", links: ["Cologne", "Aftershave", "Deodorant"] },
    { title: "Premium", links: ["Chanel", "Dior", "Gucci", "Tom Ford"] },
  ]
};

const MEGA_MENU_BRANDS = {
  popular: ["Nykaa Cosmetics", "Dot & Key", "Kay Beauty", "Maybelline New York", "Lakme", "L'Oreal Paris", "MAC", "Plum", "Cetaphil", "The Ordinary", "Laneige", "Innisfree"],
  luxe: ["Estee Lauder", "Bobbi Brown", "Clinique", "MAC", "Charlotte Tilbury", "Kérastase"]
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { totalItems } = useCart();
  const { wishlist } = useWishlist(); 
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mega Menu State
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState("Skin");
  const [activeBrandTab, setActiveBrandTab] = useState("popular");

  // Api Fetch State (For later use)
  const [apiCategories, setApiCategories] = useState([]);

  // Fetch API Categories (Replace logic as per your API response)
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setApiCategories(data); // Use this state to replace MEGA_MENU_CATEGORIES later
      } catch (error) {
        console.error("Failed to fetch categories");
      }
    };
    fetchApiData();
  }, []);

  // Close everything on route change
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
    setActiveMegaMenu(null);
  }, [pathname]);

  // Prevent scrolling for mobile sidebar
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
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
        className="sticky top-0 w-full bg-white z-50 transition-all duration-300 relative border-b border-gray-200"
        onMouseLeave={() => setActiveMegaMenu(null)} // Close mega menu when mouse leaves header area completely
      >
        {/* --- MAIN HEADER STRIP --- */}
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 md:px-8 h-16 md:h-20 flex items-center justify-between bg-white">
          
          {/* Mobile Menu Toggle */}
          <div className="flex-1 flex items-center md:hidden">
            <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-900 focus:outline-none">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Spacer for Desktop */}
          <div className="hidden md:block flex-1"></div>

          {/* Brand Logo */}
          <div className="flex-[2] flex justify-center">
            <Link href="/" className="flex flex-col items-center justify-center text-center group">
               <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-[0.15em] sm:tracking-[0.2em] uppercase leading-none group-hover:text-[#d81b60] transition-colors">
                  VÉLOURS
               </h1>
               <span className="text-[9px] sm:text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1 md:mt-1.5 font-medium">
                  Atelier
               </span>
            </Link>
          </div>

          {/* Action Icons */}
          <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6 text-gray-900">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`transition-colors focus:outline-none ${isSearchOpen ? 'text-[#d81b60]' : 'hover:text-[#d81b60]'}`}>
              {isSearchOpen ? <X className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" /> : <Search className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />}
            </button>

            <Link href="/wishlist" className="relative hover:text-[#d81b60] transition-colors hidden sm:block">
              <Heart className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              {wishlist.length > 0 && <span className="absolute -top-1.5 -right-2 bg-[#d81b60] text-white text-[9px] font-bold w-4 h-4 md:w-4 md:h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
            </Link>
            
            <Link href="/account" className="hover:text-[#d81b60] transition-colors hidden sm:block">
              <User className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </Link>
            
            <Link href="/cart" className="relative hover:text-[#d81b60] transition-colors">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              {totalItems > 0 && <span className="absolute -top-1.5 -right-2 bg-[#d81b60] text-white text-[9px] font-bold w-4 h-4 md:w-4 md:h-4 rounded-full flex items-center justify-center">{totalItems}</span>}
            </Link>
          </div>
        </div>

        {/* --- DESKTOP NAVIGATION BAR --- */}
        <div className="hidden md:flex w-full bg-white border-t border-gray-100 items-center justify-center h-12 gap-8 lg:gap-12 relative">
           {DESKTOP_NAV_ITEMS.map((item) => (
              <div 
                key={item.id} 
                className="h-full flex items-center"
                onMouseEnter={() => item.hasMegaMenu ? setActiveMegaMenu(item.id) : setActiveMegaMenu(null)}
              >
                <Link 
                  href={item.href}
                  className={`text-[11px] lg:text-xs font-bold tracking-widest uppercase transition-colors relative group h-full flex items-center
                    ${activeMegaMenu === item.id ? "text-[#d81b60]" : "text-gray-700 hover:text-[#d81b60]"}`}
                >
                  {item.name}
                  {/* Underline Indicator */}
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
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] border-t border-gray-100 z-40 hidden md:block"
            >
              <div className="max-w-[1400px] mx-auto flex h-[450px]">
                {/* Left Sidebar (Category Tabs) */}
                <div className="w-[20%] bg-gray-50 border-r border-gray-100 py-4 flex flex-col">
                  {Object.keys(MEGA_MENU_CATEGORIES).map((cat) => (
                    <button
                      key={cat}
                      onMouseEnter={() => setActiveCategoryTab(cat)}
                      className={`text-left px-6 py-3 text-[13px] font-semibold transition-colors flex justify-between items-center
                        ${activeCategoryTab === cat ? 'bg-white text-[#d81b60] border-l-4 border-[#d81b60]' : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'}`}
                    >
                      {cat}
                      {activeCategoryTab === cat && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                {/* Right Area (Sub-categories Columns) */}
                <div className="w-[80%] bg-white p-8 grid grid-cols-4 gap-8 overflow-y-auto">
                  {MEGA_MENU_CATEGORIES[activeCategoryTab as keyof typeof MEGA_MENU_CATEGORIES].map((col, idx) => (
                    <div key={idx} className="flex flex-col">
                      <h3 className="font-bold text-gray-900 text-[13px] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{col.title}</h3>
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
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] border-t border-gray-100 z-40 hidden md:block"
            >
              <div className="max-w-[1400px] mx-auto flex h-[450px]">
                
                {/* Left Sidebar (Search & A-Z) */}
                <div className="w-[25%] bg-white border-r border-gray-100 p-6 flex flex-col h-full">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search Brands" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[#d81b60]"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs tracking-wider uppercase mb-4">Top Brands</h3>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                     {MEGA_MENU_BRANDS.popular.map((brand, i) => (
                       <Link key={i} href={`/brands/${brand.toLowerCase()}`} className="text-[13px] text-gray-600 hover:text-[#d81b60]" onClick={() => setActiveMegaMenu(null)}>{brand}</Link>
                     ))}
                  </div>
                </div>

                {/* Right Area (Brand Logos/Grid) */}
                <div className="w-[75%] bg-gray-50/50 p-8 flex flex-col">
                  {/* Brand Tabs */}
                  <div className="flex gap-4 mb-8">
                     <button 
                       onMouseEnter={() => setActiveBrandTab("popular")}
                       className={`px-8 py-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors ${activeBrandTab === "popular" ? 'bg-[#d81b60] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                     >
                       Popular
                     </button>
                     <button 
                       onMouseEnter={() => setActiveBrandTab("luxe")}
                       className={`px-8 py-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-colors ${activeBrandTab === "luxe" ? 'bg-[#d81b60] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                     >
                       Luxe
                     </button>
                  </div>

                  {/* Brand Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    {MEGA_MENU_BRANDS[activeBrandTab as keyof typeof MEGA_MENU_BRANDS].map((brand, idx) => (
                      <Link 
                        key={idx}
                        href={`/brands/${brand.toLowerCase()}`}
                        onClick={() => setActiveMegaMenu(null)}
                        className="bg-white border border-gray-100 hover:border-pink-200 rounded-lg p-4 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-all h-20 group"
                      >
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#d81b60]">{brand}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- SEARCH DROPDOWN (Global Search) --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-16 md:top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg z-40 overflow-hidden"
          >
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-4 md:py-6">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for beauty, serums, perfumes..."
                  autoFocus
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-pink-100 focus:bg-white rounded-xl py-3 md:py-4 pl-12 pr-24 text-sm md:text-base outline-none transition-all shadow-inner"
                />
                <button type="submit" className="absolute right-2 bg-black text-white px-5 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#d81b60] transition-colors">
                  Search
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[300px] sm:w-[350px] bg-white z-[70] shadow-2xl flex flex-col overflow-y-auto md:hidden"
            >
              <div className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-5 sticky top-0 z-10">
                <div className="flex flex-col">
                   <span className="font-black text-lg text-gray-900 tracking-widest uppercase">VÉLOURS</span>
                   <span className="text-[8px] text-gray-400 tracking-[0.2em] uppercase">Atelier</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-[#d81b60]">
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

              <div className="p-6 mt-auto bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-center gap-6 pb-4 border-b border-gray-200">
                   <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#d81b60]">
                      <Heart className="w-5 h-5" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Saved</span>
                   </Link>
                   <Link href="/account" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#d81b60]">
                      <User className="w-5 h-5" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Account</span>
                   </Link>
                   <Link href="/cart" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#d81b60]">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Cart</span>
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