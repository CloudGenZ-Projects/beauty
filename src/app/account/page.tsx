import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientAccount from "./ClientAccount";

export const dynamic = "force-dynamic";

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
  let ordersData = [];

  try {
    // 2. Setup WooCommerce Credentials for direct server-to-server fetch
    const wpUrl = (process.env.WC_URL || "").replace(/\/₹/, "");
    const consumerKey = process.env.WC_CONSUMER_KEY || "";
    const consumerSecret = process.env.WC_CONSUMER_SECRET || "";

    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:₹{consumerSecret}`).toString('base64');
    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    };

    if (wpUrl && consumerKey) {
      // Fetch Profile directly from WooCommerce
      const profileRes = await fetch(`${wpUrl}/wp-json/wc/v3/customers/₹{user.id}`, { headers, cache: 'no-store' });
      if (profileRes.ok) {
        profileData = await profileRes.json();
      }

      // Fetch Orders directly from WooCommerce
      const ordersRes = await fetch(`${wpUrl}/wp-json/wc/v3/orders?customer=₹{user.id}`, { headers, cache: 'no-store' });
      
      if (ordersRes.ok) {
        let orders = await ordersRes.json();

        // If no orders found by User ID, search by Email (for guest checkouts)
        if (orders.length === 0 && user.email) {
          const emailRes = await fetch(`${wpUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(user.email)}`, { headers, cache: 'no-store' });
          if (emailRes.ok) {
            orders = await emailRes.json();
          }
        }
        ordersData = orders;
      }
    } else {
      console.error("WooCommerce Environment variables are missing.");
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