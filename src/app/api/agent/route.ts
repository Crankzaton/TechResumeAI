import { NextResponse } from "next/server";
import {
  getAgentSettings,
  listAgentEvents,
  saveAgentSettings,
} from "@/lib/storage";
import { isSmtpConfigured } from "@/lib/email";
import { isOneDriveConfigured } from "@/lib/onedrive";
import type { AgentSettings } from "@/lib/types";

function publicSettings(settings: AgentSettings) {
  return {
    ...settings,
    smtp: {
      ...settings.smtp,
      pass: settings.smtp.pass ? "••••••••" : "",
    },
    oneDrive: {
      ...settings.oneDrive,
      clientSecret: settings.oneDrive?.clientSecret ? "••••••••" : "",
      refreshToken: settings.oneDrive?.refreshToken ? "••••••••" : "",
    },
  };
}

export async function GET() {
  const settings = await getAgentSettings();
  const events = await listAgentEvents(40);
  return NextResponse.json({
    settings: publicSettings(settings),
    smtpConfigured: isSmtpConfigured(settings),
    oneDriveConfigured: isOneDriveConfigured(settings),
    events,
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<AgentSettings> & {
    smtp?: Partial<AgentSettings["smtp"]> & { pass?: string };
    oneDrive?: Partial<AgentSettings["oneDrive"]>;
  };

  const current = await getAgentSettings();
  const nextPass =
    body.smtp?.pass && body.smtp.pass !== "••••••••"
      ? body.smtp.pass
      : current.smtp.pass;

  const nextOdSecret =
    body.oneDrive?.clientSecret && body.oneDrive.clientSecret !== "••••••••"
      ? body.oneDrive.clientSecret
      : current.oneDrive.clientSecret;
  const nextOdRefresh =
    body.oneDrive?.refreshToken && body.oneDrive.refreshToken !== "••••••••"
      ? body.oneDrive.refreshToken
      : current.oneDrive.refreshToken;

  const saved = await saveAgentSettings({
    ...body,
    smtp: {
      ...current.smtp,
      ...(body.smtp || {}),
      pass: nextPass,
    },
    oneDrive: {
      ...current.oneDrive,
      ...(body.oneDrive || {}),
      clientSecret: nextOdSecret,
      refreshToken: nextOdRefresh,
    },
  });

  return NextResponse.json({
    settings: publicSettings(saved),
    smtpConfigured: isSmtpConfigured(saved),
    oneDriveConfigured: isOneDriveConfigured(saved),
  });
}
