import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { DbAppointment } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/appointments — patient gets their own appointments */
export async function GET() {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const userId = new ObjectId(jwt.sub);

    const query = jwt.role === "patient"
      ? { patientId: userId }
      : { therapistId: userId };

    const appts = await db.collection<DbAppointment>("appointments")
      .find(query)
      .sort({ date: 1, time: 1 })
      .toArray();

    return NextResponse.json({
      appointments: appts.map(a => ({
        id: a._id!.toString(),
        patientId: a.patientId.toString(),
        therapistId: a.therapistId.toString(),
        patientName: a.patientName,
        date: a.date,
        time: a.time,
        durationMinutes: a.durationMinutes,
        type: a.type,
        status: a.status,
        notes: a.notes,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    return NextResponse.json({ error: "Failed to fetch appointments." }, { status: 500 });
  }
}

/** POST /api/appointments — patient books an appointment */
export async function POST(req: NextRequest) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (jwt.role !== "patient") return NextResponse.json({ error: "Only patients can book." }, { status: 403 });

    const { date, time, type, notes } = await req.json();
    if (!date || !time) return NextResponse.json({ error: "Date and time are required." }, { status: 400 });

    const db = await getDb();
    const patientId = new ObjectId(jwt.sub);

    // Find this patient's therapist
    const user = await db.collection("users").findOne({ _id: patientId });
    if (!user?.therapistId) return NextResponse.json({ error: "No therapist assigned." }, { status: 400 });

    const appt: DbAppointment = {
      patientId,
      therapistId: user.therapistId,
      patientName: jwt.name,
      date,
      time,
      durationMinutes: 50,
      type: type ?? "in-clinic",
      status: "pending",
      notes: notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<DbAppointment>("appointments").insertOne(appt);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error("POST /api/appointments error:", err);
    return NextResponse.json({ error: "Failed to book appointment." }, { status: 500 });
  }
}
