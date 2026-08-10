"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface MegaMenuCategories {
  [categoryName: string]: {
    title: string;
    links: string[];
  }[];
}

export interface BrandItem {
  id?: number;
  name?: string;
  slug?: string;
  logo?: string;
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
// SAFE HELPER FUNCTIONS (Prevent Undefined/404 Errors)
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
  const [activeBrandTab, setActiveBrandTab] = useState<string>("popular");

  const isCategoryMenu = activeMegaMenu && categories[activeMegaMenu];
  const activeColumns = isCategoryMenu ? categories[activeMegaMenu] : [];

  const currentBrandsList =
    brands && brands[activeBrandTab as keyof MegaMenuBrands]
      ? brands[activeBrandTab as keyof MegaMenuBrands]
      : brands?.popular || [];

  return (
    <AnimatePresence>
      {/* --- CATEGORY MEGA MENU --- */}
      {isCategoryMenu && activeColumns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 z-30 hidden md:block"
        >
          <div className="max-w-[1400px] mx-auto p-8">
            <div className="grid grid-cols-4 gap-8 min-h-[250px] max-h-[400px] overflow-y-auto custom-scrollbar">
              {activeColumns.map((col, idx) => (
                <div key={idx} className="flex flex-col">
                  <h3 className="font-bold text-gray-900 text-[13px] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                    {col.title}
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {col.links.map((link, lIdx) => (
                      <Link
                        key={lIdx}
                        href={`/shop?category=${encodeURIComponent(link.toLowerCase())}`}
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

      {/* --- BRANDS MEGA MENU --- */}
      {activeMegaMenu === "brands" && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 z-30 hidden md:block"
        >
          <div className="max-w-[1400px] mx-auto flex h-[420px]">
            {/* Left Sidebar: Top Brands List */}
            <div className="w-[25%] bg-white border-r border-gray-100 p-6 flex flex-col h-full">
              <h3 className="font-bold text-gray-900 text-xs tracking-wider uppercase mb-4">
                Top Brands
              </h3>
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                {brands.popular?.map((brand, i) => {
                  const bName = getBrandName(brand);
                  const bSlug = getBrandSlug(brand);
                  if (!bName) return null;

                  return (
                    <Link
                      key={i}
                      href={`/brands/${bSlug}`}
                      className="text-[13px] text-gray-600 hover:text-[#d81b60] transition-colors"
                      onClick={() => setActiveMegaMenu(null)}
                    >
                      {bName}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Grid Display */}
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

              <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[300px] custom-scrollbar p-1">
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
                      className="bg-white border border-gray-100 hover:border-pink-200 rounded-lg p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all h-20 group"
                    >
                      {bLogo ? (
                        <img
                          src={bLogo}
                          alt={bName}
                          className="h-8 max-w-[85%] object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-700 group-hover:text-[#d81b60] line-clamp-1">
                          {bName}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}