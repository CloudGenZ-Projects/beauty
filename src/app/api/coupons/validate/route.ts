import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid promo code." },
        { status: 400 }
      );
    }

    const wpUrl = (process.env.WC_URL || "").replace(/\/$/, "");
    const consumerKey = process.env.WC_CONSUMER_KEY || "";
    const consumerSecret = process.env.WC_CONSUMER_SECRET || "";

    if (!wpUrl || !consumerKey || !consumerSecret) {
      console.error("[Coupon API] Missing WooCommerce environment credentials.");
      return NextResponse.json(
        { success: false, message: "Coupon verification service unavailable." },
        { status: 500 }
      );
    }

    const authHeader =
      "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    // Query WooCommerce REST API for Coupon Code
    const wcEndpoint = `${wpUrl}/wp-json/wc/v3/coupons?code=${encodeURIComponent(
      code.trim().toLowerCase()
    )}`;

    const res = await fetch(wcEndpoint, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[Coupon API Error] WC Response Status: ${res.status}`);
      return NextResponse.json(
        { success: false, message: "Failed to verify coupon with store." },
        { status: 500 }
      );
    }

    const coupons = await res.json();

    if (!Array.isArray(coupons) || coupons.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid coupon code. Please check for typos.",
      });
    }

    const coupon = coupons[0];

    // 1. Check Expiry Date
    if (coupon.date_expires) {
      const expiryDate = new Date(coupon.date_expires);
      if (expiryDate < new Date()) {
        return NextResponse.json({
          success: false,
          message: "This coupon code has expired.",
        });
      }
    }

    // 2. Check Usage Limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({
        success: false,
        message: "Coupon usage limit has been reached.",
      });
    }

    // 3. Check Minimum Order Amount
    const minAmount = parseFloat(coupon.minimum_amount || "0");
    if (minAmount > 0 && subtotal < minAmount) {
      return NextResponse.json({
        success: false,
        message: `Minimum spend of $${minAmount.toLocaleString()} required for code "${coupon.code.toUpperCase()}".`,
      });
    }

    // 4. Check Maximum Order Amount Limit
    const maxAmount = parseFloat(coupon.maximum_amount || "0");
    if (maxAmount > 0 && subtotal > maxAmount) {
      return NextResponse.json({
        success: false,
        message: `Maximum spend limit of $${maxAmount.toLocaleString()} exceeded for this coupon.`,
      });
    }

    // Calculate Discount Amount
    const rawValue = parseFloat(coupon.amount || "0");
    let discountAmount = 0;
    let discountType: "percent" | "fixed" = "fixed";

    if (coupon.discount_type === "percent") {
      discountType = "percent";
      discountAmount = (subtotal * rawValue) / 100;
    } else {
      // fixed_cart or fixed_product
      discountType = "fixed";
      discountAmount = Math.min(rawValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      code: coupon.code.toUpperCase(),
      discountAmount: discountAmount,
      discountType: discountType,
      rawValue: rawValue,
      message: "Coupon applied successfully!",
    });

  } catch (error) {
    console.error("[Coupon Validation Error]:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}