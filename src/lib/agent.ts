import {
  addAgentEvent,
  createResume,
  findTechnologyByName,
  getAgentSettings,
  getFormConnection,
  getResume,
  getTechnology,
  listTechnologies,
  updateResume,
} from "./storage";
import { sendResumeReadyEmail } from "./email";
import { saveResumeToOneDrive } from "./onedrive";
import { normalizeFormBody } from "./map-form";
import type {
  LayoutStyle,
  ResumeData,
  ResumeInput,
  Technology,
} from "./types";
import { SAMPLE_PROFILES } from "./sample-profiles";
import { LAYOUT_OPTIONS } from "./default-technologies";

/**
 * Technology from the Google Form field wins.
 * Form-connection default is only a fallback.
 */
export async function resolveTechnology(
  themeHint?: string,
  formConnectionId?: string,
): Promise<Technology> {
  if (themeHint) {
    const found = await findTechnologyByName(themeHint);
    if (found) return found;
  }

  if (formConnectionId) {
    const conn = await getFormConnection(formConnectionId);
    if (conn) {
      const tech = await getTechnology(conn.technologyId);
      if (tech) return tech;
    }
  }

  const all = await listTechnologies();
  const active = all.find((t) => t.active) || all[0];
  if (!active) {
    throw new Error("No technologies configured in admin console");
  }
  return active;
}

export function resumeFromMapped(
  mapped: ReturnType<typeof normalizeFormBody>,
  tech: Technology,
  extras?: Partial<ResumeInput>,
): ResumeInput {
  return {
    source: mapped.source || "form",
    technologyId: tech.id,
    technologyName: tech.name,
    layout: tech.layout,
    themeColors: tech.colors,
    fullName: mapped.fullName,
    headline: mapped.headline,
    contact: mapped.contact,
    expertise: mapped.expertise,
    certifications: mapped.certifications,
    languages: mapped.languages,
    workExperience: mapped.workExperience,
    education: mapped.education,
    additionalWorks: mapped.additionalWorks,
    notes: mapped.notes,
    agentLog: [`Matched technology: ${tech.name} (from Technology field / catalog)`],
    ...extras,
  };
}

async function persistAndNotify(
  resume: ResumeData,
  settings: Awaited<ReturnType<typeof getAgentSettings>>,
  opts?: { sendEmail?: boolean; redesigned?: boolean },
) {
  let current = resume;

  const od = await saveResumeToOneDrive(settings, current);
  if (od.ok) {
    current =
      (await updateResume(current.id, {
        oneDriveWebUrl: od.webUrl,
        oneDriveItemId: od.itemId,
        agentLog: [
          ...(current.agentLog || []),
          `Saved to OneDrive: ${od.webUrl}`,
        ],
      })) || current;
    await addAgentEvent({
      type: "onedrive_saved",
      message: `Saved ${current.resumeNumber} to OneDrive`,
      resumeId: current.id,
      meta: od.webUrl ? { webUrl: od.webUrl } : undefined,
    });
  } else if (settings.oneDrive?.enabled) {
    current =
      (await updateResume(current.id, {
        agentLog: [
          ...(current.agentLog || []),
          `OneDrive skipped: ${od.error}`,
        ],
      })) || current;
  }

  const shouldEmail =
    opts?.sendEmail ?? (settings.autoEmail && settings.autoGenerate);

  let emailSent = false;
  let emailError: string | undefined;
  let emailPreview: string | undefined;

  if (shouldEmail) {
    const result = await sendResumeReadyEmail(settings, current, {
      redesigned: opts?.redesigned,
    });
    emailSent = result.ok;
    emailError = result.error;
    emailPreview = result.preview;

    if (result.ok) {
      current =
        (await updateResume(current.id, {
          status: "emailed",
          emailedAt: new Date().toISOString(),
          emailError: undefined,
          agentLog: [
            ...(current.agentLog || []),
            `Emailed ${settings.notifyEmail} with ID ${current.resumeNumber}`,
          ],
        })) || current;
      await addAgentEvent({
        type: "email_sent",
        message: `Emailed ${current.resumeNumber} (${current.fullName}) to ${settings.notifyEmail}`,
        resumeId: current.id,
      });
    } else {
      current =
        (await updateResume(current.id, {
          emailError: result.error,
          agentLog: [
            ...(current.agentLog || []),
            `Email not sent: ${result.error}`,
          ],
        })) || current;
      await addAgentEvent({
        type: "email_failed",
        message: `${current.resumeNumber}: ${result.error || "Email failed"}`,
        resumeId: current.id,
      });
    }
  }

  return { resume: current, emailSent, emailError, emailPreview };
}

/** Core agent pipeline: build resume + OneDrive + email */
export async function runResumeAgent(options: {
  body: Record<string, unknown>;
  formConnectionId?: string;
  source?: ResumeData["source"];
  sendEmail?: boolean;
}): Promise<{
  resume: ResumeData;
  emailSent: boolean;
  emailError?: string;
  emailPreview?: string;
}> {
  const settings = await getAgentSettings();
  const mapped = normalizeFormBody(options.body);

  const explicitTech =
    mapped.themeHint ||
    String(
      options.body.technologyName ||
        options.body.theme ||
        options.body.technology ||
        options.body["Technology"] ||
        options.body["Technology Theme"] ||
        options.body["Resume Theme"] ||
        options.body.Platform ||
        "",
    ) ||
    undefined;

  const tech = await resolveTechnology(
    explicitTech,
    options.formConnectionId,
  );

  const input = resumeFromMapped(mapped, tech, {
    source: options.source || mapped.source || "agent",
    formConnectionId: options.formConnectionId,
    status: "generating",
  });

  if (!input.fullName) {
    throw new Error("Full name is required");
  }
  if (!explicitTech && !options.formConnectionId) {
    // still ok — falls back to default tech, but log it
    input.agentLog = [
      ...(input.agentLog || []),
      "Warning: Technology field missing — used default technology",
    ];
  }

  let resume = await createResume(input);

  await addAgentEvent({
    type: "form_received",
    message: `Received submission for ${resume.fullName} → ${resume.resumeNumber}`,
    resumeId: resume.id,
    technologyId: tech.id,
  });

  resume =
    (await updateResume(resume.id, {
      status: "ready",
      agentLog: [
        ...(resume.agentLog || []),
        `Resume ${resume.resumeNumber} generated`,
        `Theme: ${tech.name} / ${tech.layout}`,
      ],
    })) || resume;

  await addAgentEvent({
    type: "resume_built",
    message: `Built ${resume.resumeNumber}: ${tech.name} resume for ${resume.fullName}`,
    resumeId: resume.id,
    technologyId: tech.id,
  });

  return persistAndNotify(resume, settings, { sendEmail: options.sendEmail });
}

export async function buildSampleForTechnology(
  technologyId: string,
): Promise<ResumeData> {
  const tech = await getTechnology(technologyId);
  if (!tech) throw new Error("Technology not found");

  const profile =
    SAMPLE_PROFILES[tech.slug] ||
    SAMPLE_PROFILES[tech.id] ||
    SAMPLE_PROFILES.default;

  const { resume } = await runResumeAgent({
    body: {
      ...profile,
      theme: tech.name,
      technologyName: tech.name,
      Technology: tech.name,
      source: "sample",
    },
    source: "sample",
    sendEmail: false,
  });

  return resume;
}

export async function reEmailResume(resumeId: string) {
  const settings = await getAgentSettings();
  const resume = await getResume(resumeId);
  if (!resume) throw new Error("Resume not found");
  return persistAndNotify(resume, settings, { sendEmail: true });
}

function nextLayout(current: LayoutStyle, used: LayoutStyle[] = []): LayoutStyle {
  const order = LAYOUT_OPTIONS.map((o) => o.id);
  const pool = order.filter((l) => l !== current && !used.includes(l));
  if (pool.length) return pool[0];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

/**
 * Redesign an existing resume by Resume ID (TR-1001) or internal id.
 * Optionally switch technology and/or layout, then email again.
 */
export async function redesignResume(options: {
  idOrNumber: string;
  technology?: string;
  layout?: LayoutStyle;
  sendEmail?: boolean;
}): Promise<{
  resume: ResumeData;
  emailSent: boolean;
  emailError?: string;
  emailPreview?: string;
}> {
  const existing = await getResume(options.idOrNumber);
  if (!existing) throw new Error(`Resume not found: ${options.idOrNumber}`);

  const settings = await getAgentSettings();
  let tech = await getTechnology(existing.technologyId);
  if (options.technology) {
    tech =
      (await findTechnologyByName(options.technology)) ||
      (await getTechnology(options.technology));
  }
  if (!tech) throw new Error("Technology not found for redesign");

  const used = existing.previousLayouts || [];
  const layout =
    options.layout ||
    (options.technology ? tech.layout : nextLayout(existing.layout, used));

  const previousLayouts = [...used, existing.layout].slice(-8);

  let resume =
    (await updateResume(existing.id, {
      technologyId: tech.id,
      technologyName: tech.name,
      layout,
      themeColors: tech.colors,
      designVersion: (existing.designVersion || 1) + 1,
      previousLayouts,
      status: "ready",
      agentLog: [
        ...(existing.agentLog || []),
        `Redesign v${(existing.designVersion || 1) + 1}: ${tech.name} / ${layout}`,
      ],
    })) || existing;

  await addAgentEvent({
    type: "redesign",
    message: `Redesigned ${resume.resumeNumber} → ${tech.name} / ${layout} (v${resume.designVersion})`,
    resumeId: resume.id,
    technologyId: tech.id,
  });

  return persistAndNotify(resume, settings, {
    sendEmail: options.sendEmail ?? true,
    redesigned: true,
  });
}
