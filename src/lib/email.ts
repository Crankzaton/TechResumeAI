import nodemailer from "nodemailer";
import type { AgentSettings, ResumeData } from "./types";
import { renderResumePdf, resumePdfFilename } from "./pdf";

export function isSmtpConfigured(settings: AgentSettings): boolean {
  return Boolean(
    settings.smtp.host &&
      settings.smtp.user &&
      settings.smtp.pass &&
      settings.notifyEmail,
  );
}

export async function sendResumeReadyEmail(
  settings: AgentSettings,
  resume: ResumeData,
  opts?: { redesigned?: boolean; attachPdf?: boolean },
): Promise<{ ok: boolean; preview?: string; error?: string }> {
  const base = settings.publicBaseUrl.replace(/\/$/, "");
  const previewUrl = `${base}/preview/${resume.id}`;
  const attachPdf = opts?.attachPdf !== false;

  const subject = opts?.redesigned
    ? `[TechResumeAI] Redesign ready — ${resume.resumeNumber} · ${resume.fullName}`
    : `[TechResumeAI] ${resume.resumeNumber} ready — ${resume.fullName} (${resume.technologyName})`;

  const text = [
    `Hi ${settings.freelancerName || "there"},`,
    "",
    opts?.redesigned
      ? `A redesign was generated for Resume ID ${resume.resumeNumber}.`
      : `A new resume was prepared automatically.`,
    "",
    `Resume ID: ${resume.resumeNumber}`,
    `Design version: v${resume.designVersion}`,
    `Candidate: ${resume.fullName}`,
    `Customer email: ${resume.contact.email || "—"}`,
    `Technology: ${resume.technologyName}`,
    `Layout: ${resume.layout}`,
    "",
    attachPdf
      ? "The resume PDF is attached to this email."
      : `Open preview: ${previewUrl}`,
    "",
    `Preview link (optional): ${previewUrl}`,
    "",
    "— TechResumeAI Agent",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#0c1220">
    <p style="display:inline-block;background:#0c1220;color:#8fd9a8;padding:6px 12px;border-radius:999px;font-weight:700;letter-spacing:0.04em;margin:0 0 12px">
      Resume ID ${escapeHtml(resume.resumeNumber)} · v${resume.designVersion}
    </p>
    <h2 style="margin:0 0 8px">${opts?.redesigned ? "Redesign ready" : "Resume ready"}</h2>
    <p>${attachPdf ? "The themed resume PDF is attached — share it with your customer." : "Open the preview link below."}</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Resume ID</td><td><strong>${escapeHtml(resume.resumeNumber)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Candidate</td><td><strong>${escapeHtml(resume.fullName)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Technology</td><td>${escapeHtml(resume.technologyName)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Layout</td><td>${escapeHtml(resume.layout)}</td></tr>
    </table>
    <p style="color:#5b6b7c;font-size:13px">Optional preview: <a href="${previewUrl}">${previewUrl}</a></p>
  </div>`;

  if (!isSmtpConfigured(settings)) {
    console.info("[TechResumeAI Agent] Email skipped (SMTP not configured)");
    console.info(text);
    return {
      ok: false,
      preview: text,
      error:
        "SMTP not configured. Add Gmail App Password in Agent settings. Resume is still ready.",
    };
  }

  let pdf: Buffer | undefined;
  let pdfError: string | undefined;
  if (attachPdf) {
    try {
      pdf = await renderResumePdf(resume);
    } catch (error) {
      pdfError =
        error instanceof Error ? error.message : "PDF generation failed";
      console.error("[TechResumeAI] PDF attach failed:", pdfError);
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtp.host,
      port: settings.smtp.port,
      secure: settings.smtp.secure,
      auth: {
        user: settings.smtp.user,
        pass: settings.smtp.pass,
      },
    });

    await transporter.sendMail({
      from: settings.fromEmail || settings.smtp.user,
      to: settings.notifyEmail,
      subject,
      text: pdfError
        ? `${text}\n\n(PDF attachment failed: ${pdfError}. Use preview link.)`
        : text,
      html,
      attachments: pdf
        ? [
            {
              filename: resumePdfFilename(resume),
              content: pdf,
              contentType: "application/pdf",
            },
          ]
        : undefined,
    });

    return {
      ok: true,
      error: pdfError ? `Email sent, but PDF attach failed: ${pdfError}` : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
