// app/wishlist/page.tsx
import { cookies } from "next/headers";
import ClientWishlist from "./ClientWishlist";

export const dynamic = "force-dynamic";

export default async function WishlistPageSSR() {
  // Next.js 15: Await cookies
  const cookieStore = await cookies();
  const wishlistCookie = cookieStore.get("loiseau_wishlist");

  let initialWishlist = [];

  try {
    // Agar cookie mein wishlist hai, toh usko server par hi parse kar lo
    if (wishlistCookie?.value) {
      initialWishlist = JSON.parse(decodeURIComponent(wishlistCookie.value));
    }
  } catch (error) {
    console.error("Failed to parse wishlist cookie on server", error);
  }

  // Data ko Client component mein pass kar do
  return <ClientWishlist initialWishlist={initialWishlist} />;
}