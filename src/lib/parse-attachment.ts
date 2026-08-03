import { PDFParse } from "pdf-parse";

export async function extractTextFromUpload(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
): Promise<string> {
  const lower = filename.toLowerCase();
  const mime = (mimeType || "").toLowerCase();

  if (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    mime.startsWith("text/")
  ) {
    return buffer.toString("utf8");
  }

  if (lower.endsWith(".docx") || mime.includes("wordprocessingml")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  if (lower.endsWith(".pdf") || mime.includes("pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  const asText = buffer.toString("utf8");
  if (asText.replace(/\0/g, "").trim().length > 40) return asText;
  throw new Error(
    `Unsupported file type for ${filename}. Use PDF, DOCX, or TXT.`,
  );
}

/** Heuristic parse of freeform resume / LinkedIn text into form-like fields */
export function parseResumeText(raw: string): {
  fullName?: string;
  email?: string;
  phones?: string;
  linkedin?: string;
  expertise?: string;
  workExperience?: string;
  education?: string;
  headline?: string;
} {
  const text = raw.replace(/\r/g, "").trim();
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{8,}\d)/);
  const linkedinMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i,
  );

  const fullName =
    lines[0] && lines[0].length < 60 && !lines[0].includes("@")
      ? lines[0]
      : undefined;

  const expertise = sectionAfter(text, [
    "skills",
    "expertise",
    "technical skills",
    "core competencies",
  ]);

  const workExperience =
    sectionAfter(text, [
      "experience",
      "work experience",
      "professional experience",
      "employment",
    ]) || text;

  const education = sectionAfter(text, ["education", "academics"]);

  const headline =
    lines.find(
      (l, i) =>
        i > 0 &&
        i < 4 &&
        l.length < 90 &&
        !l.includes("@") &&
        /developer|engineer|consultant|architect|analyst|manager/i.test(l),
    ) || undefined;

  return {
    fullName,
    email: emailMatch?.[0],
    phones: phoneMatch?.[0],
    linkedin: linkedinMatch?.[0],
    expertise: expertise?.slice(0, 2500),
    workExperience: workExperience?.slice(0, 8000),
    education: education?.slice(0, 2000),
    headline,
  };
}

function sectionAfter(text: string, headings: string[]): string | undefined {
  const lower = text.toLowerCase();
  for (const heading of headings) {
    const idx = lower.search(
      new RegExp(`(?:^|\\n)\\s*${heading}\\s*(?:\\n|:)`),
    );
    if (idx >= 0) {
      const from = text
        .slice(idx)
        .replace(new RegExp(`^\\s*${heading}\\s*:?\\s*`, "i"), "");
      const next = from.search(
        /\n\s*(experience|education|skills|projects|certifications|languages|summary)\s*(?:\n|:)/i,
      );
      return (next > 40 ? from.slice(0, next) : from).trim();
    }
  }
  return undefined;
}
