import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("velours_token") || cookieStore.get("woocommerce_session");
  const wishlistCookie = cookieStore.get("velours_wishlist");

  const isLoggedIn = Boolean(token?.value);

  let userWishlist = [];
  if (wishlistCookie?.value) {
    try {
      userWishlist = JSON.parse(decodeURIComponent(wishlistCookie.value));
    } catch (e) {
      userWishlist = [];
    }
  }

  // If user is logged in, attempt to fetch user wishlist from WordPress / DB
  if (isLoggedIn) {
    try {
      const wpRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/velours/v1/wishlist`, {
        headers: {
          Authorization: `Bearer ${token?.value}`,
        },
        cache: "no-store",
      });

      if (wpRes.ok) {
        const wpData = await wpRes.json();
        if (Array.isArray(wpData)) {
          userWishlist = wpData;
        }
      }
    } catch (err) {
      console.error("Failed to fetch user wishlist from WordPress API:", err);
    }
  }

  return NextResponse.json({
    isLoggedIn,
    wishlist: userWishlist,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const wishlist = body.wishlist || [];

    const cookieStore = await cookies();
    const token = cookieStore.get("velours_token") || cookieStore.get("woocommerce_session");
    const isLoggedIn = Boolean(token?.value);

    const response = NextResponse.json({ success: true, isLoggedIn });
    response.cookies.set("velours_wishlist", JSON.stringify(wishlist), {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    if (isLoggedIn) {
      await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/velours/v1/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.value}`,
        },
        body: JSON.stringify({ wishlist }),
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}