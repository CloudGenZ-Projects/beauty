import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await query("SELECT id FROM beautyshop_users WHERE email = ?", [cleanEmail]);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      "INSERT INTO beautyshop_users (email, password, first_name, last_name, status) VALUES (?, ?, ?, ?, 'active')",
      [cleanEmail, hashedPassword, firstName || null, lastName || null]
    );

    const newUser = {
      id: result.insertId,
      email: cleanEmail,
      firstName: firstName || "",
      lastName: lastName || "",
    };

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Registration failed. Please check database connection." }, { status: 500 });
  }
}
