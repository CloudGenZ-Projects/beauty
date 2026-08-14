import { cookies } from "next/headers";
import ClientWishlist from "./ClientWishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | GLOBE TRADING ",
  description: "View and manage your saved luxury beauty items.",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const wishlistCookie = cookieStore.get("velours_wishlist");
  const tokenCookie = cookieStore.get("velours_token") || cookieStore.get("woocommerce_session");

  let initialWishlist = [];
  const isLoggedIn = Boolean(tokenCookie?.value);

  try {
    if (wishlistCookie?.value) {
      initialWishlist = JSON.parse(decodeURIComponent(wishlistCookie.value));
    }
  } catch (error) {
    console.error("Failed to parse wishlist cookie on server:", error);
  }

  return (
    <ClientWishlist
      initialWishlist={initialWishlist}
      initialIsLoggedIn={isLoggedIn}
    />
  );
}