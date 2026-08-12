"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface BrandItem {
  id?: number | string;
  name?: string;
  title?: string;
  slug?: string;
  logo?: string;
}

export interface MegaMenuCategories {
  [categoryName: string]: {
    title: string;
    links: string[];
  }[];
}

export interface MegaMenuBrands {
  popular: (BrandItem | string)[];
  luxe: (BrandItem | string)[];
}

interface MegaMenuProps {
  activeMegaMenu: string | null;
  setActiveMegaMenu: (menu: string | null) => void;
  categories: MegaMenuCategories;
  brands: MegaMenuBrands;
}

// -----------------------------------------------------------------
// SAFE HELPER FUNCTIONS (Prevent Undefined / Runtime Crashes)
// -----------------------------------------------------------------
const getBrandName = (brand: any): string => {
  if (!brand) return "";
  if (typeof brand === "string") return brand;
  return brand.name || brand.title || String(brand);
};

const getBrandSlug = (brand: any): string => {
  if (!brand) return "all";
  if (typeof brand === "string") {
    return brand
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  if (brand.slug) return brand.slug;
  if (brand.name) {
    return brand.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  return "all";
};

const getBrandLogo = (brand: any): string | undefined => {
  if (typeof brand === "object" && brand !== null && brand.logo) {
    return brand.logo;
  }
  return undefined;
};

export default function MegaMenu({
  activeMegaMenu,
  setActiveMegaMenu,
  categories,
  brands,
}: MegaMenuProps) {
  const [activeBrandTab, setActiveBrandTab] = useState<"popular" | "luxe">("popular");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<number | null>(null);

  // Lock background scroll on mobile when menu is active
  useEffect(() => {
    if (activeMegaMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeMegaMenu]);

  const isCategoryMenu = activeMegaMenu && categories[activeMegaMenu];
  const activeColumns = isCategoryMenu ? categories[activeMegaMenu] : [];

  const currentBrandsList =
    brands && brands[activeBrandTab]
      ? brands[activeBrandTab]
      : brands?.popular || [];

  const toggleMobileCategory = (index: number) => {
    setExpandedMobileCategory(expandedMobileCategory === index ? null : index);
  };

  if (!activeMegaMenu) return null;

  return (
    <AnimatePresence>
      {/* ----------------------------------------------------------------- */}
      {/* MOBILE / TABLET OVERLAY BACKDROP (< md)                            */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        onClick={() => setActiveMegaMenu(null)}
      />

      {/* ----------------------------------------------------------------- */}
      {/* DESKTOP MEGA MENU (md+)                                           */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        key="desktop-megamenu"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 z-50 hidden md:block"
      >
        {/* --- CATEGORIES VIEW (DESKTOP) --- */}
        {isCategoryMenu && activeColumns.length > 0 && (
          <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {activeColumns.map((col, idx) => (
                <div key={idx} className="flex flex-col">
                  <h3 className="font-bold text-gray-900 text-xs lg:text-[13px] uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                    {col.title}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {col.links.map((link, lIdx) => (
                      <Link
                        key={lIdx}
                        href={`/shop?category=${encodeURIComponent(link.toLowerCase())}`}
                        className="text-gray-600 hover:text-[#d81b60] text-xs lg:text-[13px] transition-all hover:translate-x-1 duration-150 inline-block py-0.5"
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
        )}

        {/* --- BRANDS VIEW (DESKTOP) --- */}
        {activeMegaMenu === "brands" && (
          <div className="max-w-[1400px] mx-auto flex h-[440px]">
            {/* Left Sidebar: Popular Quick Links */}
            <div className="w-1/3 lg:w-1/4 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col h-full">
              <h3 className="font-bold text-gray-900 text-xs tracking-wider uppercase mb-4">
                Top Featured Brands
              </h3>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-2 custom-scrollbar">
                {brands.popular?.map((brand, i) => {
                  const bName = getBrandName(brand);
                  const bSlug = getBrandSlug(brand);
                  if (!bName) return null;

                  return (
                    <Link
                      key={i}
                      href={`/brands/${bSlug}`}
                      className="text-xs lg:text-[13px] text-gray-600 hover:text-[#d81b60] transition-colors py-1"
                      onClick={() => setActiveMegaMenu(null)}
                    >
                      {bName}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Grid Display */}
            <div className="w-2/3 lg:w-3/4 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                {/* Switcher Tabs */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setActiveBrandTab("popular")}
                    onMouseEnter={() => setActiveBrandTab("popular")}
                    className={`px-6 py-2 text-xs font-bold tracking-widest uppercase rounded transition-all ${
                      activeBrandTab === "popular"
                        ? "bg-[#d81b60] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Popular Brands
                  </button>
                  <button
                    onClick={() => setActiveBrandTab("luxe")}
                    onMouseEnter={() => setActiveBrandTab("luxe")}
                    className={`px-6 py-2 text-xs font-bold tracking-widest uppercase rounded transition-all ${
                      activeBrandTab === "luxe"
                        ? "bg-[#d81b60] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Luxe Brands
                  </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                  {currentBrandsList.map((brand, idx) => {
                    const bName = getBrandName(brand);
                    const bSlug = getBrandSlug(brand);
                    const bLogo = getBrandLogo(brand);

                    if (!bName) return null;

                    return (
                      <Link
                        key={idx}
                        href={`/brands/${bSlug}`}
                        onClick={() => setActiveMegaMenu(null)}
                        className="bg-white border border-gray-100 hover:border-pink-300 rounded-lg p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all h-20 group"
                      >
                        {bLogo ? (
                          <img
                            src={bLogo}
                            alt={bName}
                            className="h-8 max-w-[85%] object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-700 group-hover:text-[#d81b60] line-clamp-2">
                            {bName}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* View All Footer Link */}
              <div className="pt-4 border-t border-gray-100 text-right">
                <Link
                  href="/brands"
                  onClick={() => setActiveMegaMenu(null)}
                  className="text-xs font-bold text-[#d81b60] hover:underline uppercase tracking-wider inline-flex items-center gap-1"
                >
                  View All Brands &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* MOBILE & TABLET DRAWER SHEET (< md)                              */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        key="mobile-megamenu"
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 max-h-[85vh] bg-white shadow-2xl rounded-b-2xl z-50 md:hidden flex flex-col overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
            {activeMegaMenu === "brands" ? "Browse Brands" : activeMegaMenu}
          </h2>
          <button
            onClick={() => setActiveMegaMenu(null)}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200/50 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* MOBILE: CATEGORY ACCORDION */}
          {isCategoryMenu && activeColumns.length > 0 && (
            <div className="space-y-3">
              {activeColumns.map((col, idx) => {
                const isExpanded = expandedMobileCategory === idx;
                return (
                  <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleMobileCategory(idx)}
                      className="w-full flex items-center justify-between p-3.5 bg-gray-50/50 text-left text-xs font-bold uppercase tracking-wider text-gray-800"
                    >
                      <span>{col.title}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-[#d81b60]" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-white flex flex-col gap-2 border-t border-gray-100">
                        {col.links.map((link, lIdx) => (
                          <Link
                            key={lIdx}
                            href={`/shop?category=${encodeURIComponent(link.toLowerCase())}`}
                            className="text-xs text-gray-600 hover:text-[#d81b60] py-1.5 px-2 rounded hover:bg-pink-50/50 transition-colors"
                            onClick={() => setActiveMegaMenu(null)}
                          >
                            {link}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* MOBILE: BRANDS CONTENT */}
          {activeMegaMenu === "brands" && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setActiveBrandTab("popular")}
                  className={`py-2 text-xs font-bold tracking-wider uppercase rounded-md transition-all ${
                    activeBrandTab === "popular"
                      ? "bg-white text-[#d81b60] shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => setActiveBrandTab("luxe")}
                  className={`py-2 text-xs font-bold tracking-wider uppercase rounded-md transition-all ${
                    activeBrandTab === "luxe"
                      ? "bg-white text-[#d81b60] shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Luxe
                </button>
              </div>

              {/* Brand Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {currentBrandsList.map((brand, idx) => {
                  const bName = getBrandName(brand);
                  const bSlug = getBrandSlug(brand);
                  const bLogo = getBrandLogo(brand);

                  if (!bName) return null;

                  return (
                    <Link
                      key={idx}
                      href={`/brands/${bSlug}`}
                      onClick={() => setActiveMegaMenu(null)}
                      className="bg-white border border-gray-100 rounded-lg p-2.5 flex flex-col items-center justify-center text-center h-16 shadow-sm active:scale-95 transition-transform"
                    >
                      {bLogo ? (
                        <img
                          src={bLogo}
                          alt={bName}
                          className="h-6 max-w-[85%] object-contain"
                        />
                      ) : (
                        <span className="text-[11px] font-bold text-gray-700 line-clamp-1">
                          {bName}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Navigation Link */}
              <div className="pt-2 text-center">
                <Link
                  href="/brands"
                  onClick={() => setActiveMegaMenu(null)}
                  className="inline-block py-2 px-4 bg-gray-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider w-full"
                >
                  Explore All Brands
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}