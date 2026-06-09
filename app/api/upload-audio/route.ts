import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthUser } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;
    if (!audio) return NextResponse.json({ error: "No audio file." }, { status: 400 });

    // Convert file to buffer
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary as a raw/video resource
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "video",  // handles audio files
          folder: `fluentvoice/${jwt.sub}`,
          public_id: `session_${Date.now()}`,
          format: "mp3",
        },
        (err, res) => {
          if (err || !res) reject(err ?? new Error("Upload failed"));
          else resolve(res as { secure_url: string });
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload audio error:", err);
    return NextResponse.json({ error: "Audio upload failed." }, { status: 500 });
  }
}
