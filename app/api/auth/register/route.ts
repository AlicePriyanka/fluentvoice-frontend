import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { signToken, cookieOptions } from "@/lib/auth";
import type { DbUser, SafeUser } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!["patient", "therapist"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection<DbUser>("users");

    const existing = await users.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();
    const joinedDate = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    // For patients: auto-assign to the first therapist in the system
    let therapistId: import("mongodb").ObjectId | undefined;
    if (role === "patient") {
      const therapist = await users.findOne({ role: "therapist" });
      if (therapist) therapistId = therapist._id as import("mongodb").ObjectId;
    }

    const result = await users.insertOne({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
      role,
      joinedDate,
      createdAt: now,
      ...(therapistId ? { therapistId } : {}),
    });

    const userId = result.insertedId.toString();

    const token = await signToken({
      sub: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role,
    });

    const safeUser: SafeUser = {
      id: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role,
      joinedDate,
    };

    const res = NextResponse.json({ user: safeUser }, { status: 201 });
    res.cookies.set({ ...cookieOptions, value: token });
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
