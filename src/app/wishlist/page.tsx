import { cookies } from "next/headers";
import ClientWishlist from "./ClientWishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | VÉLOURS Atelier",
  description: "View and manage your saved luxury beauty items.",
};

export const dynamic = "force-dynamic";

export default async function WishlistPageSSR() {
  const cookieStore = await cookies();
  const wishlistCookie = cookieStore.get("loiseau_wishlist");

  let initialWishlist = [];

  try {
    if (wishlistCookie?.value) {
      initialWishlist = JSON.parse(decodeURIComponent(wishlistCookie.value));
    }
  } catch (error) {
    console.error("Failed to parse wishlist cookie on server", error);
  }

  return <ClientWishlist initialWishlist={initialWishlist} />;
}