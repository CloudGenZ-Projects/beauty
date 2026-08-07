import { NextResponse } from "next/server";
import { updateWooOrder, addWooOrderNote } from "@/lib/woocommerce";

export async function POST(req: Request) {
  try {
    const { orderId, reason } = await req.json();

    if (!orderId || !reason) {
      return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
    }

    // 1. Add a note to the WooCommerce order so the Store Admin knows why the user wants a return
    const noteContent = `⚠️ CUSTOMER RETURN REQUEST: ${reason}`;
    await addWooOrderNote(orderId, noteContent, false); // false means private note for admin

    // 2. Change WooCommerce Order status to "on-hold" 
    // (This flags the order in the Admin Dashboard so the admin can process the refund via Stripe/WooCommerce)
    await updateWooOrder(orderId, { status: "on-hold" });

    return NextResponse.json({ success: true, message: "Return request submitted successfully." });
    
  } catch (error: any) {
    console.error("Return Request API Error:", error);
    return NextResponse.json({ error: "Failed to submit return request." }, { status: 500 });
  }
}