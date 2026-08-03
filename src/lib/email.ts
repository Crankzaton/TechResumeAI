import nodemailer from "nodemailer";
import type { AgentSettings, ResumeData } from "./types";

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
): Promise<{ ok: boolean; preview?: string; error?: string }> {
  const previewUrl = `${settings.publicBaseUrl.replace(/\/$/, "")}/preview/${resume.id}`;

  const subject = `[TechResumeAI] Resume ready — ${resume.fullName} (${resume.technologyName})`;
  const text = [
    `Hi ${settings.freelancerName || "there"},`,
    "",
    `A new resume was prepared automatically.`,
    "",
    `Candidate: ${resume.fullName}`,
    `Email: ${resume.contact.email || "—"}`,
    `Technology: ${resume.technologyName}`,
    `Source: ${resume.source}`,
    `Status: ${resume.status}`,
    "",
    `Open preview (one click): ${previewUrl}`,
    "",
    `From there, use Download / Print PDF and share with your customer.`,
    "",
    `— TechResumeAI Agent`,
  ].join("\n");

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#0c1220">
    <h2 style="margin:0 0 8px">Resume ready</h2>
    <p>A new themed resume was prepared for your customer.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Candidate</td><td><strong>${escapeHtml(resume.fullName)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Email</td><td>${escapeHtml(resume.contact.email || "—")}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Technology</td><td>${escapeHtml(resume.technologyName)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#5b6b7c">Source</td><td>${escapeHtml(resume.source)}</td></tr>
    </table>
    <p>
      <a href="${previewUrl}" style="display:inline-block;background:#1f6f5b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
        Open resume (one click)
      </a>
    </p>
    <p style="color:#5b6b7c;font-size:13px">Print → Save as PDF, then share with your customer.</p>
  </div>`;

  if (!isSmtpConfigured(settings)) {
    // Dev-friendly fallback: log and return preview content
    console.info("[TechResumeAI Agent] Email skipped (SMTP not configured)");
    console.info(text);
    return {
      ok: false,
      preview: text,
      error:
        "SMTP not configured. Set notify email + SMTP in Agent settings (or env). Resume is still ready.",
    };
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
      text,
      html,
    });

    return { ok: true };
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
