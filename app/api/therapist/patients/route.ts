import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * GET /api/therapist/patients
 * Returns all registered patients with computed session stats.
 * Requires a valid therapist JWT cookie.
 */
export async function GET() {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (jwt.role !== "therapist") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const db = await getDb();

    // Fetch only patients assigned to THIS therapist
    const therapistOid = new ObjectId(jwt.sub);
    const users = db.collection("users");
    const patients = await users
      .find({ role: "patient", therapistId: therapistOid })
      .project({ _id: 1, name: 1, email: 1, joinedDate: 1 })
      .toArray();

    if (patients.length === 0) {
      return NextResponse.json({ patients: [] });
    }

    // For each patient, aggregate their sessions
    const sessions = db.collection("sessions");
    const patientIds = patients.map((p) => p._id);

    // One aggregation query — group by userId
    const stats = await sessions
      .aggregate([
        { $match: { userId: { $in: patientIds } } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            avgFluency: { $avg: "$fluency_score" },
            firstScore: { $first: "$fluency_score" },
            lastScore: { $last: "$fluency_score" },
            lastDate: { $last: "$createdAt" },
          },
        },
      ])
      .toArray();

    // Build a lookup map: userId string -> stats
    const statsMap: Record<
      string,
      { count: number; avgFluency: number; firstScore: number; lastScore: number; lastDate: Date }
    > = {};
    for (const s of stats) {
      statsMap[s._id.toString()] = {
        count: s.count,
        avgFluency: Math.round(s.avgFluency),
        firstScore: s.firstScore,
        lastScore: s.lastScore,
        lastDate: s.lastDate,
      };
    }

    // Fetch treatment plans to get therapist-assigned data
    const plans = db.collection("treatment_plans");
    const allPlans = await plans
      .find({ patientId: { $in: patients.map((p) => p._id.toString()) } })
      .toArray();
    const planMap: Record<string, typeof allPlans[0]> = {};
    for (const pl of allPlans) planMap[pl.patientId] = pl;

    function deriveTrend(first: number, last: number): "improving" | "stable" | "declining" {
      if (last - first > 5) return "improving";
      if (first - last > 5) return "declining";
      return "stable";
    }

    const result = patients.map((p) => {
      const id = (p._id as ObjectId).toString();
      const s = statsMap[id];
      const plan = planMap[id];

      return {
        id,
        name: p.name,
        email: p.email,
        joinedDate: p.joinedDate ?? "—",
        sessionsCount: s?.count ?? 0,
        avgFluency: s?.avgFluency ?? 0,
        trend: s ? deriveTrend(s.firstScore, s.lastScore) : "stable",
        lastSessionDate: s?.lastDate ?? null,
        // Treatment-plan fields (set by therapist)
        condition: plan?.condition ?? null,
        nextAppointment: plan?.nextAppointment ?? null,
      };
    });

    return NextResponse.json({ patients: result });
  } catch (err) {
    console.error("GET /api/therapist/patients error:", err);
    return NextResponse.json({ error: "Failed to fetch patients." }, { status: 500 });
  }
}
