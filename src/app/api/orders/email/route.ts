import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/$/, "");
    
    // Auth header string setup
    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    // STEP 1: Pehle Order Details fetch karo (Taki Dynamic Data mil sake)
    const orderResponse = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!orderResponse.ok) throw new Error("Failed to fetch order details");
    const orderData = await orderResponse.json();

    // STEP 2: WooCommerce order me forcefully currency 'INR' update karna (Agar pehle se nahi hai)
    if (orderData.currency !== 'INR') {
      await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
        method: 'PUT', // Order update karne ke liye PUT
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currency: 'INR'
        })
      });
    }

    // STEP 3: Dynamic Email Note Create karna
    const customerName = orderData.billing?.first_name || "Customer";
    const orderTotal = orderData.total;
    
    // Yahan note dynamic ho gaya hai
    const dynamicNote = `Hello ${customerName}! As requested, here is the receipt for your order #${orderId}. Your total order amount is ₹${orderTotal}. Thank you for shopping with us!`;

    // STEP 4: WooCommerce ko Email send karne ka command dena
    const res = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        note: dynamicNote,
        customer_note: true // Ye true hone par hi customer ko email jayega
      })
    });

    if (!res.ok) throw new Error("Failed to request email");

    return NextResponse.json({ success: true, message: "Receipt requested successfully." });
  } catch (error: any) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}