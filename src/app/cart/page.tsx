// P:\git\buaty\7\src\app\cart\page.tsx
import { cookies } from "next/headers";
import ClientCart from "./ClientCart";

export const dynamic = "force-dynamic";

export default async function CartPageSSR() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("loiseau_cart");

  let initialCart = [];

  try {
    // Agar cookie mein cart hai, toh usko server par hi parse kar lo
    if (cartCookie?.value) {
      initialCart = JSON.parse(decodeURIComponent(cartCookie.value));
    }
  } catch (error) {
    console.error("Failed to parse cart cookie on server", error);
  }

  // Server data ko Client component mein bhej do
  return <ClientCart initialCart={initialCart} />;
}