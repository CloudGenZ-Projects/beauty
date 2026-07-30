"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext"; // <-- Added Wishlist Context
import { ShoppingBag, Search, User, Menu, X, ChevronRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { totalItems } = useCart();
  const { wishlist } = useWishlist(); // <-- To show wishlist item count
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close sidebar and search on route change
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const MAIN_NAV = [
    { name: "HOME", href: "/" },
    { name: "CATALOGUE", href: "/shop" },
    { name: "BARRIER CREAMS", href: "/shop?category=creams" },
    { name: "SERUMS & DROPS", href: "/shop?category=serums" },
    { name: "HAUTE PARFUM", href: "/shop?category=perfume" },
  ];

  const FILTER_CATEGORIES = [
    "BODY CARE",
    "CREAMS",
    "lip balm",
    "perfume"
  ];

  return (
    <>
      {/* --- MAIN HEADER --- */}
      <header className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all duration-300 relative">
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Mobile Menu Toggle */}
          <div className="flex-1 flex items-center md:hidden">
            <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-900 focus:outline-none">
              <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Left: Desktop Menu Button */}
          <div className="hidden md:flex flex-1 items-center">
            <button 
              onClick={() => setIsOpen(true)} 
              className="group flex items-center gap-2 p-2 -ml-2 text-gray-900 hover:text-[#d81b60] transition-colors focus:outline-none"
            >
              <Menu className="w-6 h-6" />
              <span className="text-xs font-bold tracking-widest uppercase mt-0.5 group-hover:translate-x-1 transition-transform">Menu</span>
            </button>
          </div>

          {/* Center: Brand Logo (VÉLOURS ATELIER) */}
          <div className="flex-[2] flex justify-center">
            <Link href="/" className="flex flex-col items-center justify-center text-center group">
               <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-[0.15em] sm:tracking-[0.2em] uppercase leading-none group-hover:text-[#d81b60] transition-colors">
                  VÉLOURS
               </h1>
               <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 tracking-[0.3em] uppercase mt-1 md:mt-2 font-medium">
                  Atelier
               </span>
            </Link>
          </div>

          {/* Right: Action Icons */}
          <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6 text-gray-900">
            
            {/* 1. Search Toggle Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`transition-colors focus:outline-none ${isSearchOpen ? 'text-[#d81b60]' : 'hover:text-[#d81b60]'}`}
            >
              {isSearchOpen ? <X className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" /> : <Search className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />}
            </button>

            {/* 2. Wishlist Icon (New) */}
            <Link href="/wishlist" className="relative hover:text-[#d81b60] transition-colors hidden sm:block focus:outline-none">
              <Heart className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 md:-top-2 md:-right-2 bg-pink-500 text-white text-[9px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            {/* 3. Account Icon */}
            <Link href="/account" className="hover:text-[#d81b60] transition-colors hidden sm:block">
              <User className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </Link>
            
            {/* 4. Cart Icon */}
            <Link href="/cart" className="relative hover:text-[#d81b60] transition-colors focus:outline-none">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 md:-top-2 md:-right-2 bg-[#d81b60] text-white text-[9px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* --- SEARCH DROPDOWN UI --- */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg z-40 overflow-hidden"
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
                  <button 
                    type="submit" 
                    className="absolute right-2 bg-black text-white px-5 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#d81b60] transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation Links (Under Header) */}
        <div className="hidden lg:flex w-full bg-white border-t border-gray-100 items-center justify-center h-12 gap-10">
           {MAIN_NAV.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-xs font-bold text-gray-600 hover:text-[#d81b60] tracking-widest uppercase transition-colors relative group"
              >
                 {link.name}
                 <span className="absolute -bottom-4 left-0 w-0 h-[2px] bg-[#d81b60] transition-all duration-300 group-hover:w-full"></span>
              </Link>
           ))}
        </div>
      </header>

      {/* --- SIDEBAR MENU (Overlay + Drawer) --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Overlay Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            
            {/* Sidebar Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-[300px] sm:w-[350px] bg-white z-[70] shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-5 sticky top-0 z-10">
                <div className="flex flex-col">
                   <span className="font-black text-lg text-gray-900 tracking-widest uppercase">VÉLOURS</span>
                   <span className="text-[8px] text-gray-400 tracking-[0.2em] uppercase">Atelier</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 -mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all focus:outline-none"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Main Navigation Links (Visible on mobile inside drawer) */}
              <div className="flex flex-col py-4 border-b border-gray-100 lg:hidden">
                <span className="px-6 text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-2">Menu</span>
                {MAIN_NAV.map((link) => (
                  <Link 
                    key={`mob-${link.name}`} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 text-sm text-gray-800 font-bold hover:bg-gray-50 hover:text-[#d81b60] flex items-center justify-between group transition-colors uppercase tracking-wider"
                  >
                    {link.name}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#d81b60] transition-colors" />
                  </Link>
                ))}
              </div>

              {/* Filter By Category Section */}
              <div className="flex flex-col py-6">
                <div className="px-6 mb-4 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Filter By Category</span>
                </div>
                
                <Link 
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 text-sm text-gray-900 font-medium hover:bg-pink-50 hover:text-[#d81b60] transition-colors flex items-center justify-between group border-l-4 border-transparent hover:border-[#d81b60]"
                >
                  <span className="underline decoration-1 underline-offset-4">Shop All Formulations</span>
                  <ChevronRight className="w-4 h-4 text-transparent group-hover:text-[#d81b60] transition-colors" />
                </Link>

                <div className="mt-2">
                   {FILTER_CATEGORIES.map((cat) => (
                     <Link 
                       key={cat} 
                       href={`/shop?category=${encodeURIComponent(cat.toLowerCase())}`}
                       onClick={() => setIsOpen(false)}
                       className="px-6 py-3 text-sm text-gray-600 font-medium hover:bg-gray-50 hover:text-[#d81b60] border-l-4 border-transparent hover:border-gray-300 flex items-center justify-between group transition-all uppercase tracking-wide"
                     >
                       {cat}
                       <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#d81b60] transition-colors" />
                     </Link>
                   ))}
                </div>
              </div>

              {/* Bottom Actions / Footer of Sidebar */}
              <div className="p-6 mt-auto bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-center gap-6 pb-4 border-b border-gray-200">
                   
                   <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#d81b60] relative">
                      <Heart className="w-5 h-5" />
                      {wishlist.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d81b60] rounded-full"></span>}
                      <span className="text-[10px] uppercase font-bold tracking-widest">Saved</span>
                   </Link>

                   <Link href="/account" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#d81b60]">
                      <User className="w-5 h-5" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Account</span>
                   </Link>
                   
                   <Link href="/cart" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#d81b60] relative">
                      <ShoppingBag className="w-5 h-5" />
                      {totalItems > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d81b60] rounded-full"></span>}
                      <span className="text-[10px] uppercase font-bold tracking-widest">Cart</span>
                   </Link>
                </div>
                
                <button className="w-full bg-black text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#d81b60] transition-colors shadow-md">
                  Contact Support
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}