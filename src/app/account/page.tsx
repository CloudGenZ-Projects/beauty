import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientAccount from "./ClientAccount";

export const dynamic = "force-dynamic";

// Force Indian Rupee Symbol (₹) across all orders
function resolveCurrencySymbol(currencyCode: string = "INR", symbol?: string) {
  // If symbol is HTML entity (e.g. &#8377;), or undefined, or USD/INR, force standard '₹'
  if (!symbol || symbol.includes("&") || symbol === "$" || currencyCode?.toUpperCase() === "INR") {
    return "₹";
  }
  return "₹"; // Hard guarantee Rupee symbol
}

export default async function AccountPageSSR() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session");

  // 1. Check if user is logged in
  if (!sessionCookie?.value) {
    redirect("/auth");
  }

  let user;
  try {
    user = JSON.parse(decodeURIComponent(sessionCookie.value));
  } catch (error) {
    redirect("/auth");
  }

  let profileData = null;
  let ordersData: any[] = [];

  try {
    // 2. Setup WooCommerce Credentials for direct server-to-server fetch
    const wpUrl = (process.env.WC_URL || "").replace(/\/$/, "");
    const consumerKey = process.env.WC_CONSUMER_KEY || "";
    const consumerSecret = process.env.WC_CONSUMER_SECRET || "";

    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    };

    if (wpUrl && consumerKey && consumerSecret) {
      // Fetch Profile directly from WooCommerce
      if (user.id) {
        const profileRes = await fetch(`${wpUrl}/wp-json/wc/v3/customers/${user.id}`, { 
          headers, 
          cache: 'no-store' 
        });
        if (profileRes.ok) {
          profileData = await profileRes.json();
        }
      }

      // Fetch Orders directly from WooCommerce by customer ID
      let ordersRes = null;
      if (user.id) {
        ordersRes = await fetch(`${wpUrl}/wp-json/wc/v3/orders?customer=${user.id}&per_page=50`, { 
          headers, 
          cache: 'no-store' 
        });
      }
      
      let orders: any[] = [];
      if (ordersRes && ordersRes.ok) {
        orders = await ordersRes.json();
      }

      // If no orders found by User ID, search by Email (for guest/synced checkouts)
      if ((!orders || orders.length === 0) && user.email) {
        const emailRes = await fetch(`${wpUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(user.email)}&per_page=50`, { 
          headers, 
          cache: 'no-store' 
        });
        if (emailRes.ok) {
          const emailOrders = await emailRes.json();
          // Filter strictly by billing email to prevent inaccurate search matches
          orders = emailOrders.filter((o: any) => 
            o.billing?.email?.toLowerCase() === user.email.toLowerCase()
          );
        }
      }

      // Normalize orders and ensure currency symbol is always '₹'
      ordersData = (orders || []).map((order: any) => ({
        ...order,
        currency_symbol: resolveCurrencySymbol(order.currency, order.currency_symbol)
      }));
    } else {
      console.error("WooCommerce Environment variables (WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET) are missing.");
    }
  } catch (error) {
    console.error("Error fetching WooCommerce data in SSR:", error);
  }

  return (
    <ClientAccount 
      user={user} 
      initialProfile={profileData} 
      initialOrders={ordersData} 
    />
  );
}