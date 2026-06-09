import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * GET /api/therapist/patients/[id]
 * Returns a single patient's info + all their sessions with timestamps.
 * Requires therapist JWT.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (jwt.role !== "therapist") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const db = await getDb();

    // Fetch patient user record
    let patientOid: ObjectId;
    try {
      patientOid = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const users = db.collection("users");
    const patient = await users.findOne(
      { _id: patientOid, role: "patient" },
      { projection: { _id: 1, name: 1, email: 1, joinedDate: 1 } }
    );

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // Fetch all sessions for this patient, newest first
    const sessions = db.collection("sessions");
    const rawSessions = await sessions
      .find({ userId: patientOid })
      .sort({ createdAt: -1 })
      .toArray();

    const mappedSessions = rawSessions.map((s) => ({
      id: (s._id as ObjectId).toString(),
      // Full timestamp for display: "May 27, 2026, 11:59 AM"
      date: new Date(s.createdAt).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }),
      // ISO string for sorting/relative time
      createdAt: s.createdAt,
      fluency_score: s.fluency_score,
      severity: s.severity,
      speech_rate: s.speech_rate,
      transcript: s.transcript,
      disfluencies: s.disfluencies ?? [],
      pauses: s.pauses ?? 0,
      timeline: s.timeline ?? [],
      audioUrl: s.audioUrl ?? null,
    }));

    // Compute stats
    const count = mappedSessions.length;
    const avgFluency = count > 0
      ? Math.round(mappedSessions.reduce((s, r) => s + r.fluency_score, 0) / count)
      : 0;

    let trend: "improving" | "stable" | "declining" = "stable";
    if (count >= 2) {
      const first = mappedSessions[mappedSessions.length - 1].fluency_score;
      const last  = mappedSessions[0].fluency_score;
      if (last - first > 5) trend = "improving";
      else if (first - last > 5) trend = "declining";
    }

    // Fetch treatment plan
    const plans = db.collection("treatment_plans");
    const plan = await plans.findOne({ patientId: id });

    return NextResponse.json({
      patient: {
        id,
        name: patient.name,
        email: patient.email,
        joinedDate: patient.joinedDate ?? "—",
        condition: plan?.condition ?? "Fluency disorder",
        nextAppointment: plan?.nextAppointment ?? null,
        goals: plan?.goals ?? [],
        exercises: plan?.exercises ?? [],
        remarks: plan?.remarks ?? "",
      },
      stats: { count, avgFluency, trend },
      sessions: mappedSessions,
    });
  } catch (err) {
    console.error("GET /api/therapist/patients/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch patient data." }, { status: 500 });
  }
}
