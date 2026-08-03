import {
  addAgentEvent,
  createResume,
  findTechnologyByName,
  getAgentSettings,
  getFormConnection,
  getTechnology,
  listTechnologies,
  updateResume,
} from "./storage";
import { sendResumeReadyEmail } from "./email";
import { normalizeFormBody } from "./map-form";
import type { ResumeData, ResumeInput, Technology } from "./types";
import { SAMPLE_PROFILES } from "./sample-profiles";

export async function resolveTechnology(
  themeHint?: string,
  formConnectionId?: string,
): Promise<Technology> {
  if (formConnectionId) {
    const conn = await getFormConnection(formConnectionId);
    if (conn) {
      const tech = await getTechnology(conn.technologyId);
      if (tech) return tech;
    }
  }

  if (themeHint) {
    const found = await findTechnologyByName(themeHint);
    if (found) return found;
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
    agentLog: [`Matched technology: ${tech.name}`],
    ...extras,
  };
}

/** Core agent pipeline: build resume + optional email */
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

  let resume = await createResume(input);

  await addAgentEvent({
    type: "form_received",
    message: `Received submission for ${resume.fullName}`,
    resumeId: resume.id,
    technologyId: tech.id,
  });

  resume =
    (await updateResume(resume.id, {
      status: "ready",
      agentLog: [
        ...(resume.agentLog || []),
        "Resume layout generated",
        `Theme: ${tech.name} / ${tech.layout}`,
      ],
    })) || resume;

  await addAgentEvent({
    type: "resume_built",
    message: `Built ${tech.name} resume for ${resume.fullName}`,
    resumeId: resume.id,
    technologyId: tech.id,
  });

  const shouldEmail =
    options.sendEmail ?? (settings.autoEmail && settings.autoGenerate);

  let emailSent = false;
  let emailError: string | undefined;
  let emailPreview: string | undefined;

  if (shouldEmail) {
    const result = await sendResumeReadyEmail(settings, resume);
    emailSent = result.ok;
    emailError = result.error;
    emailPreview = result.preview;

    if (result.ok) {
      resume =
        (await updateResume(resume.id, {
          status: "emailed",
          emailedAt: new Date().toISOString(),
          agentLog: [...(resume.agentLog || []), `Emailed ${settings.notifyEmail}`],
        })) || resume;
      await addAgentEvent({
        type: "email_sent",
        message: `Emailed resume link for ${resume.fullName} to ${settings.notifyEmail}`,
        resumeId: resume.id,
      });
    } else {
      resume =
        (await updateResume(resume.id, {
          emailError: result.error,
          agentLog: [
            ...(resume.agentLog || []),
            `Email not sent: ${result.error}`,
          ],
        })) || resume;
      await addAgentEvent({
        type: "email_failed",
        message: result.error || "Email failed",
        resumeId: resume.id,
      });
    }
  }

  return { resume, emailSent, emailError, emailPreview };
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
      source: "sample",
    },
    source: "sample",
    sendEmail: false,
  });

  return resume;
}

export async function reEmailResume(resumeId: string) {
  const settings = await getAgentSettings();
  const { getResume } = await import("./storage");
  const resume = await getResume(resumeId);
  if (!resume) throw new Error("Resume not found");

  const result = await sendResumeReadyEmail(settings, resume);
  if (result.ok) {
    await updateResume(resumeId, {
      status: "emailed",
      emailedAt: new Date().toISOString(),
      emailError: undefined,
    });
    await addAgentEvent({
      type: "email_sent",
      message: `Re-sent email for ${resume.fullName}`,
      resumeId,
    });
  }
  return result;
}
