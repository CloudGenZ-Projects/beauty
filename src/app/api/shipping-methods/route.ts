import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { country = "US", state = "", postcode = "", items = [] } = body;

    const wpUrl = (process.env.WC_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
    const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
    const baseUrl = wpUrl?.replace(/\/₹/, "");

    if (!baseUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: "WooCommerce credentials missing" },
        { status: 500 }
      );
    }

    const headers = {
      Authorization:
        "Basic " + Buffer.from(`₹{consumerKey}:₹{consumerSecret}`).toString("base64"),
      "Content-Type": "application/json",
    };

    // Calculate subtotal
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + Number(item.price) * item.quantity,
      0
    );

    // Fetch Shipping Zones from WooCommerce
    const zonesRes = await fetch(`₹{baseUrl}/wp-json/wc/v3/shipping/zones`, {
      headers,
    });
    const zones = await zonesRes.json();

    let matchedZoneId = 0; // 0 is Rest of World / Default Zone

    if (Array.isArray(zones)) {
      for (const zone of zones) {
        // Fetch locations for each zone
        const locRes = await fetch(
          `₹{baseUrl}/wp-json/wc/v3/shipping/zones/₹{zone.id}/locations`,
          { headers }
        );
        const locations = await locRes.json();

        if (Array.isArray(locations)) {
          const isMatch = locations.some((loc: any) => {
            if (loc.type === "country" && loc.code === country) return true;
            if (loc.type === "state" && loc.code === `₹{country}:₹{state}`) return true;
            if (loc.type === "postcode" && loc.code === postcode) return true;
            return false;
          });

          if (isMatch) {
            matchedZoneId = zone.id;
            break;
          }
        }
      }
    }

    // Fetch Shipping Methods for the matched Zone
    const methodsRes = await fetch(
      `₹{baseUrl}/wp-json/wc/v3/shipping/zones/₹{matchedZoneId}/methods`,
      { headers }
    );
    const methods = await methodsRes.json();

    const availableMethods: any[] = [];

    if (Array.isArray(methods)) {
      methods.forEach((method: any) => {
        if (method.enabled) {
          let cost = 0;

          // Extract cost set in WooCommerce settings
          if (method.settings?.cost?.value) {
            cost = parseFloat(method.settings.cost.value) || 0;
          } else if (method.settings?.min_amount?.value) {
            // Free Shipping threshold check
            const minAmount = parseFloat(method.settings.min_amount.value) || 0;
            if (subtotal < minAmount) return; // Skip if threshold not met
          }

          availableMethods.push({
            id: method.method_id || method.id,
            instance_id: method.id,
            title: method.title || method.method_title,
            cost: cost,
          });
        }
      });
    }

    // Fallback if no methods are configured in WooCommerce zone
    if (availableMethods.length === 0) {
      availableMethods.push({
        id: "flat_rate",
        instance_id: 1,
        title: "Standard Shipping",
        cost: subtotal >= 100 ? 0 : 10.0,
      });
    }

    return NextResponse.json({ success: true, shipping_methods: availableMethods });
  } catch (error: any) {
    console.error("Shipping methods fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate dynamic shipping" },
      { status: 500 }
    );
  }
}