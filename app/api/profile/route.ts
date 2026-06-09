import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { DbProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const userId = new ObjectId(jwt.sub);

    // Get base user info
    const user = await db.collection("users").findOne(
      { _id: userId },
      { projection: { passwordHash: 0 } }
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get extended profile
    const profile = await db.collection<DbProfile>("profiles").findOne({ userId });

    // Get session stats
    const sessions = db.collection("sessions");
    const stats = await sessions.aggregate([
      { $match: { userId } },
      { $group: {
        _id: null,
        count: { $sum: 1 },
        avgFluency: { $avg: "$fluency_score" },
        lastSession: { $max: "$createdAt" },
      }},
    ]).toArray();
    const s = stats[0] ?? { count: 0, avgFluency: 0, lastSession: null };

    return NextResponse.json({
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        joinedDate: user.joinedDate ?? "—",
        phone: profile?.phone ?? "",
        age: profile?.age ?? null,
        condition: profile?.condition ?? "",
        bio: profile?.bio ?? "",
        specialty: profile?.specialty ?? "",
        licenseNumber: profile?.licenseNumber ?? "",
        clinicName: profile?.clinicName ?? "",
        stats: {
          sessionsCount: s.count,
          avgFluency: s.avgFluency ? Math.round(s.avgFluency) : 0,
          lastSession: s.lastSession ?? null,
        },
      },
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const userId = new ObjectId(jwt.sub);
    const db = await getDb();

    // Update display name on user doc
    if (body.name?.trim()) {
      await db.collection("users").updateOne(
        { _id: userId },
        { $set: { name: body.name.trim() } }
      );
    }

    // Upsert extended profile
    const profileFields: Partial<DbProfile> = {
      userId,
      role: jwt.role as "patient" | "therapist",
      updatedAt: new Date(),
    };
    if (body.phone !== undefined) profileFields.phone = body.phone;
    if (body.age !== undefined) profileFields.age = body.age ? Number(body.age) : undefined;
    if (body.condition !== undefined) profileFields.condition = body.condition;
    if (body.bio !== undefined) profileFields.bio = body.bio;
    if (body.specialty !== undefined) profileFields.specialty = body.specialty;
    if (body.licenseNumber !== undefined) profileFields.licenseNumber = body.licenseNumber;
    if (body.clinicName !== undefined) profileFields.clinicName = body.clinicName;

    await db.collection<DbProfile>("profiles").updateOne(
      { userId },
      { $set: profileFields },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
