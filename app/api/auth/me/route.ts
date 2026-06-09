import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { DbUser, SafeUser } from "@/lib/types";

export async function GET() {
  try {
    const jwt = await getAuthUser();
    if (!jwt) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const db = await getDb();
    const users = db.collection<DbUser>("users");
    const user = await users.findOne({ _id: new ObjectId(jwt.sub) });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const safeUser: SafeUser = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      therapistId: user.therapistId?.toString(),
      joinedDate: user.joinedDate,
    };

    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error("Auth/me error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
