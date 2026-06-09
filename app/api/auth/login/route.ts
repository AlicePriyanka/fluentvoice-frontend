import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { signToken, cookieOptions } from "@/lib/auth";
import type { DbUser, SafeUser } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection<DbUser>("users");

    const user = await users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Constant-time comparison to prevent user enumeration
      await bcrypt.hash("dummy", 12);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const userId = user._id!.toString();

    const token = await signToken({
      sub: userId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const safeUser: SafeUser = {
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
      therapistId: user.therapistId?.toString(),
      joinedDate: user.joinedDate,
    };

    const res = NextResponse.json({ user: safeUser });
    res.cookies.set({ ...cookieOptions, value: token });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Sign in failed. Please try again." }, { status: 500 });
  }
}
