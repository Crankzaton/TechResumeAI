import { NextResponse } from "next/server";
import { runResumeAgent } from "@/lib/agent";
import {
  extractTextFromUpload,
  parseResumeText,
} from "@/lib/parse-attachment";

export const runtime = "nodejs";

/**
 * Multipart upload:
 * - fields: technology (single) OR technology_0, technology_1, ...
 * - files:  file (single) OR file_0, file_1, ...
 * Creates one resume per file (or one from text fields if no files).
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const sendEmail = form.get("sendEmail") === "true" || form.get("sendEmail") === "on";

    const entries: {
      technology: string;
      file?: File;
      fullName?: string;
      email?: string;
      phones?: string;
      expertise?: string;
      experience?: string;
    }[] = [];

    // Multi mode: file_0 + technology_0 ...
    for (let i = 0; i < 20; i++) {
      const file = form.get(`file_${i}`);
      const technology = String(form.get(`technology_${i}`) || "").trim();
      if (file instanceof File && file.size > 0) {
        entries.push({ technology: technology || "ServiceNow", file });
      }
    }

    // Single file mode
    const singleFile = form.get("file");
    if (entries.length === 0 && singleFile instanceof File && singleFile.size > 0) {
      entries.push({
        technology: String(form.get("technology") || "ServiceNow"),
        file: singleFile,
        fullName: String(form.get("fullName") || ""),
        email: String(form.get("email") || ""),
        phones: String(form.get("phones") || form.get("mobile") || ""),
        expertise: String(form.get("expertise") || form.get("skills") || ""),
        experience: String(form.get("experience") || form.get("workExperience") || ""),
      });
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Upload at least one resume file (PDF, DOCX, or TXT)" },
        { status: 400 },
      );
    }

    const created = [];
    for (const entry of entries) {
      const file = entry.file!;
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractTextFromUpload(buffer, file.name, file.type);
      const parsed = parseResumeText(text);

      const body = {
        source: "form",
        technologyName: entry.technology,
        theme: entry.technology,
        Technology: entry.technology,
        fullName:
          entry.fullName ||
          parsed.fullName ||
          file.name.replace(/\.[^.]+$/, ""),
        email: entry.email || parsed.email || "",
        phones: entry.phones || parsed.phones || "",
        linkedin: parsed.linkedin || "",
        headline: parsed.headline || "",
        expertise: entry.expertise || parsed.expertise || "",
        workExperience:
          entry.experience || parsed.workExperience || text.slice(0, 6000),
        education: parsed.education || "",
        notes: `Parsed from attachment: ${file.name}`,
        sendEmail,
      };

      const result = await runResumeAgent({
        body,
        source: "form",
        sendEmail,
      });

      created.push({
        id: result.resume.id,
        resumeNumber: result.resume.resumeNumber,
        technology: result.resume.technologyName,
        previewUrl: `/preview/${result.resume.id}`,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });
    }

    return NextResponse.json({ ok: true, resumes: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Attachment processing failed",
      },
      { status: 400 },
    );
  }
}
