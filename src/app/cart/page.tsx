import { cookies } from "next/headers";
import ClientCart from "./ClientCart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Bag | VÉLOURS Atelier",
  description: "Review your selected luxury beauty items and checkout securely.",
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("loiseau_cart");

  let initialCart = [];

  try {
    if (cartCookie?.value) {
      initialCart = JSON.parse(decodeURIComponent(cartCookie.value));
    }
  } catch (error) {
    console.error("Failed to parse cart cookie on server", error);
  }

  return <ClientCart initialCart={initialCart} />;
}