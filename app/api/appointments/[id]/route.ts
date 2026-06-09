import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/** PUT /api/appointments/[id] — confirm or cancel (therapist or patient) */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    if (!["confirmed", "cancelled", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("appointments").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/appointments/[id] error:", err);
    return NextResponse.json({ error: "Failed to update appointment." }, { status: 500 });
  }
}

/** DELETE /api/appointments/[id] — cancel/delete */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const db = await getDb();
    await db.collection("appointments").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/appointments/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
