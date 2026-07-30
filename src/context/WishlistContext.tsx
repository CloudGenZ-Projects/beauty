"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("wishlist_items");
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const updated = [...prev, item];
      localStorage.setItem("wishlist_items", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("wishlist_items", JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (id: number) => wishlist.some((item) => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};