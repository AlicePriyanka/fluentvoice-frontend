import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { DbSession } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/sessions — returns the authenticated user's sessions, newest first */
export async function GET() {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const sessions = db.collection<DbSession>("sessions");

    const results = await sessions
      .find({ userId: new ObjectId(jwt.sub) })
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = results.map((s) => ({
      id: s._id!.toString(),
      date: new Date(s.createdAt).toLocaleString("en-IN", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }),
      audioUrl: s.audioUrl ?? null,
      report: {
        fluency_score: s.fluency_score,
        severity: s.severity,
        speech_rate: s.speech_rate,
        transcript: s.transcript,
        disfluencies: s.disfluencies,
        pauses: s.pauses,
        timeline: s.timeline,
      },
    }));

    return NextResponse.json({ sessions: mapped });
  } catch (err) {
    console.error("GET /api/sessions error:", err);
    return NextResponse.json({ error: "Failed to fetch sessions." }, { status: 500 });
  }
}

/** POST /api/sessions — save a new analysis result */
export async function POST(req: NextRequest) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const {
      fluency_score,
      severity,
      speech_rate,
      transcript,
      disfluencies,
      pauses,
      timeline,
      audioUrl,
    } = body;

    if (typeof fluency_score !== "number") {
      return NextResponse.json({ error: "fluency_score is required." }, { status: 400 });
    }

    const db = await getDb();
    const sessions = db.collection<DbSession>("sessions");

    const result = await sessions.insertOne({
      userId: new ObjectId(jwt.sub),
      fluency_score,
      severity: severity ?? "moderate",
      speech_rate: speech_rate ?? 0,
      transcript: transcript ?? "",
      disfluencies: disfluencies ?? [],
      pauses: pauses ?? 0,
      timeline: timeline ?? [],
      ...(audioUrl ? { audioUrl } : {}),
      createdAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sessions error:", err);
    return NextResponse.json({ error: "Failed to save session." }, { status: 500 });
  }
}
