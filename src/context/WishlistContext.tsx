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
  
  // Ek flag taaki page load hote hi khali array save na ho jaye
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Page Load par Data Get Karna (Local storage se)
  useEffect(() => {
    const saved = localStorage.getItem("wishlist_items");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // 2. Data Save Karna (Local Storage + Cookies dono mein)
  useEffect(() => {
    if (isInitialized) {
      const wishlistString = JSON.stringify(wishlist);
      
      // Save to Local Storage
      localStorage.setItem("wishlist_items", wishlistString);
      
      // Save to Cookies (Yeh server ko read karne mein help karega)
      document.cookie = `loiseau_wishlist=${encodeURIComponent(wishlistString)}; path=/; max-age=604800; SameSite=Lax`;
    }
  }, [wishlist, isInitialized]);

  // 3. Actions (Ab sirf state update karenge, saving upar wala useEffect handle karega)
  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => [...prev, item]);
  };

  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
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