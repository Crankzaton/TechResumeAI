import { NextResponse } from "next/server";
import {
  getAgentSettings,
  listAgentEvents,
  saveAgentSettings,
} from "@/lib/storage";
import { isSmtpConfigured } from "@/lib/email";
import type { AgentSettings } from "@/lib/types";

export async function GET() {
  const settings = await getAgentSettings();
  const events = await listAgentEvents(40);
  return NextResponse.json({
    settings: {
      ...settings,
      smtp: {
        ...settings.smtp,
        pass: settings.smtp.pass ? "••••••••" : "",
      },
    },
    smtpConfigured: isSmtpConfigured(settings),
    events,
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<AgentSettings> & {
    smtp?: Partial<AgentSettings["smtp"]> & { pass?: string };
  };

  const current = await getAgentSettings();
  const nextPass =
    body.smtp?.pass && body.smtp.pass !== "••••••••"
      ? body.smtp.pass
      : current.smtp.pass;

  const saved = await saveAgentSettings({
    ...body,
    smtp: {
      ...current.smtp,
      ...(body.smtp || {}),
      pass: nextPass,
    },
  });

  return NextResponse.json({
    settings: {
      ...saved,
      smtp: { ...saved.smtp, pass: saved.smtp.pass ? "••••••••" : "" },
    },
    smtpConfigured: isSmtpConfigured(saved),
  });
}
