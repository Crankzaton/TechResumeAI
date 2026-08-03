import { NextResponse } from "next/server";
import { createResume } from "@/lib/storage";
import { mapGoogleFormPayload } from "@/lib/map-form";

/**
 * Webhook endpoint for Google Apps Script / Forms.
 * POST JSON with form field values (question titles or aliases).
 * Optional header: x-webhook-secret matching WEBHOOK_SECRET env.
 */
export async function POST(request: Request) {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const provided = request.headers.get("x-webhook-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = mapGoogleFormPayload(body);
    if (!input.fullName) {
      return NextResponse.json(
        { error: "Full Name is required in the form response" },
        { status: 400 },
      );
    }
    const resume = await createResume(input);
    return NextResponse.json({
      ok: true,
      id: resume.id,
      previewUrl: `/preview/${resume.id}`,
      theme: resume.theme,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 400 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "TechResumeAI Google Forms webhook",
    method: "POST",
    expects: "JSON body with form answers",
    docs: "/docs#google-forms",
  });
}
