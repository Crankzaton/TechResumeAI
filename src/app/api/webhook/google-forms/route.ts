import { NextResponse } from "next/server";
import { getAgentSettings, getFormConnection, listFormConnections } from "@/lib/storage";
import { runResumeAgent } from "@/lib/agent";

/**
 * Google Forms / Apps Script webhook.
 * Optional ?formId= to bind a Form Connection from admin.
 * Header x-webhook-secret validated against connection secret, agent, or env.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get("formId") || undefined;
  const provided = request.headers.get("x-webhook-secret") || "";

  let formConnectionId = formId || undefined;
  const settings = await getAgentSettings();

  if (formId) {
    const conn = await getFormConnection(formId);
    if (!conn || !conn.active) {
      return NextResponse.json(
        { error: "Form connection not found or inactive" },
        { status: 404 },
      );
    }
    if (conn.webhookSecret && provided !== conn.webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    formConnectionId = conn.id;
  } else {
    const globalSecret =
      process.env.WEBHOOK_SECRET || "";
    if (globalSecret && provided !== globalSecret) {
      // If forms exist with secrets, allow matching any active form secret
      const forms = await listFormConnections();
      const match = forms.find(
        (f) => f.active && f.webhookSecret && f.webhookSecret === provided,
      );
      if (!match && provided !== globalSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (match) formConnectionId = match.id;
    }
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await runResumeAgent({
      body,
      formConnectionId,
      source: "google-forms",
      sendEmail: settings.autoEmail,
    });

    return NextResponse.json({
      ok: true,
      id: result.resume.id,
      previewUrl: `/preview/${result.resume.id}`,
      technology: result.resume.technologyName,
      emailSent: result.emailSent,
      emailError: result.emailError,
      emailPreview: result.emailPreview,
      message: result.emailSent
        ? "Resume built and email sent to freelancer"
        : "Resume built. Configure SMTP in Agent settings to receive email alerts.",
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
    service: "TechResumeAI Agent webhook",
    method: "POST",
    tip: "Use /api/webhook/google-forms?formId=CONNECTION_ID from admin",
  });
}
