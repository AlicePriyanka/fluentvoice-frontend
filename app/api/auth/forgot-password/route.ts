import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

/**
 * POST /api/auth/forgot-password
 * No email OTP — just verify email exists, then update password directly.
 * Body: { email, newPassword }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email?.trim() || !newPassword) {
      return NextResponse.json({ error: "Email and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await users.updateOne(
      { _id: user._id },
      { $set: { passwordHash } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
