"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WishlistItem {
  id: number | string;
  name: string;
  slug: string;
  price: string;
  regular_price?: string;
  image: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number | string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number | string) => boolean;
  clearWishlist: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Helper to set cookie for SSR sync
const updateWishlistCookie = (items: WishlistItem[]) => {
  try {
    document.cookie = `velours_wishlist=₹{encodeURIComponent(
      JSON.stringify(items)
    )}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to set wishlist cookie:", err);
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load wishlist on mount (From User API if logged in, else from LocalStorage)
  useEffect(() => {
    async function initWishlist() {
      setIsLoading(true);
      try {
        // 1. Fetch user authentication status & user wishlist from API
        const res = await fetch("/api/wishlist", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(data.isLoggedIn || false);

          if (data.isLoggedIn && data.wishlist) {
            // Check if there are local guest items to merge into account
            const localGuestItems = localStorage.getItem("velours_wishlist");
            if (localGuestItems) {
              const parsedGuestItems: WishlistItem[] = JSON.parse(localGuestItems);
              if (parsedGuestItems.length > 0) {
                // Merge guest items into logged-in user wishlist
                const mergedMap = new Map();
                [...data.wishlist, ...parsedGuestItems].forEach((item) => {
                  mergedMap.set(String(item.id), item);
                });
                const mergedWishlist = Array.from(mergedMap.values());

                // Save merged items to user DB API
                await fetch("/api/wishlist", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ wishlist: mergedWishlist }),
                });

                // Clear guest storage after merge
                localStorage.removeItem("velours_wishlist");
                setWishlist(mergedWishlist);
                updateWishlistCookie(mergedWishlist);
                setIsLoading(false);
                return;
              }
            }

            setWishlist(data.wishlist);
            updateWishlistCookie(data.wishlist);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching user wishlist from API:", err);
      }

      // 2. Fallback for Guest Users (LocalStorage)
      try {
        const savedWishlist = localStorage.getItem("velours_wishlist");
        if (savedWishlist) {
          const items = JSON.parse(savedWishlist);
          setWishlist(items);
          updateWishlistCookie(items);
        }
      } catch (err) {
        console.error("Failed to load wishlist from LocalStorage:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initWishlist();
  }, []);

  // Sync wishlist updates to Backend API (if logged in) or LocalStorage (if guest)
  const syncWishlist = async (updatedWishlist: WishlistItem[]) => {
    setWishlist(updatedWishlist);
    updateWishlistCookie(updatedWishlist);

    if (isLoggedIn) {
      try {
        await fetch("/api/wishlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishlist: updatedWishlist }),
        });
      } catch (err) {
        console.error("Failed to sync wishlist to user account:", err);
      }
    } else {
      try {
        localStorage.setItem("velours_wishlist", JSON.stringify(updatedWishlist));
      } catch (err) {
        console.error("Failed to save wishlist to LocalStorage:", err);
      }
    }
  };

  const addToWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) return;
    const updated = [...wishlist, item];
    syncWishlist(updated);
  };

  const removeFromWishlist = (id: number | string) => {
    const updated = wishlist.filter((item) => String(item.id) !== String(id));
    syncWishlist(updated);
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const isInWishlist = (id: number | string) => {
    return wishlist.some((item) => String(item.id) === String(id));
  };

  const clearWishlist = () => {
    syncWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        isLoading,
        isLoggedIn,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};