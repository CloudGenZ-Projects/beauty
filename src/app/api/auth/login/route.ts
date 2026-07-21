import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const users = await query("SELECT * FROM beautyshop_users WHERE email = ? AND status = 'active'", [
      email.toLowerCase().trim(),
    ]);

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Return safe user object
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      woocommerceCustomerId: user.woocommerce_customer_id || null,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Authentication failed. Please check MySQL connection." }, { status: 500 });
  }
}
