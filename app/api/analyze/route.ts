import { NextRequest, NextResponse } from "next/server";

const HF_API = "https://ramlakshman-fluentvoice-api.hf.space/analyze";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Forward to HuggingFace with required extra fields
    const hfForm = new FormData();
    hfForm.append("audio", audio, audio.name || "recording.wav");
    hfForm.append("condition_on_previous_text", "false");
    hfForm.append("no_speech_threshold", "0.6");

    const resp = await fetch(HF_API, {
      method: "POST",
      body: hfForm,
      // HuggingFace Spaces can take a while on cold start
      signal: AbortSignal.timeout(120_000),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("HF API error:", resp.status, text);
      return NextResponse.json(
        { error: `Analysis API returned ${resp.status}: ${text.slice(0, 200)}` },
        { status: resp.status }
      );
    }

    const raw = await resp.json();

    // Normalize disfluency events — the HF API uses either "event"/"type" and
    // "time"/"start"/"timestamp" depending on the model version.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizeDisfluencies = (arr: any[]) =>
      arr.map((ev) => ({
        event: ev.event ?? ev.type ?? "unknown",
        word:  ev.word  ?? ev.token ?? undefined,
        time:  ev.time  ?? ev.start ?? ev.timestamp ?? "0:00",
        duration: ev.duration ?? undefined,
      }));

    const score = raw.fluency_score ?? raw.score ?? 0;

    // Re-derive severity from score — the model's own severity label is
    // miscalibrated (e.g. returns "severe" for score 50 which should be
    // "moderate"). Always compute it from the score so the UI is consistent.
    function scoreSeverity(s: number): "mild" | "moderate" | "severe" {
      if (s >= 70) return "mild";
      if (s >= 40) return "moderate";
      return "severe";
    }

    const normalized = {
      ...raw,
      fluency_score: score,
      severity:      scoreSeverity(score),
      speech_rate:   raw.speech_rate ?? raw.wpm ?? 0,
      transcript:    raw.transcript ?? raw.text ?? "",
      disfluencies:  normalizeDisfluencies(raw.disfluencies ?? raw.events ?? []),
      pauses:        raw.pauses ?? 0,
      timeline:      raw.timeline ?? [],
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("Analyze route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
