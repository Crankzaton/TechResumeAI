import type {
  Certification,
  Education,
  Language,
  ResumeInput,
  WorkExperience,
} from "./types";

function asString(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(String).join(", ");
  return String(value).trim();
}

function splitList(value: unknown): string[] {
  const text = asString(value);
  if (!text) return [];
  return text
    .split(/\n|;|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseWorkExperience(value: unknown): WorkExperience[] {
  const text = asString(value);
  if (!text) return [];

  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const header = lines[0] ?? "";
      const parts = header.split("|").map((p) => p.trim());
      const datePart = parts[2] ?? "";
      const [startDate = "", endDate = ""] = datePart
        .split(/\s+-\s+|–|—/)
        .map((s) => s.trim());
      const bullets = lines
        .slice(1)
        .map((l) => l.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean);
      return {
        title: parts[0] || "Role",
        company: parts[1] || "",
        startDate,
        endDate: endDate || "Current",
        bullets,
      };
    });
}

function parseEducation(value: unknown): Education[] {
  const text = asString(value);
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const parts = (lines[0] ?? "").split("|").map((p) => p.trim());
      const datePart = parts[2] ?? "";
      const [startDate = "", endDate = ""] = datePart
        .split(/\s+-\s+|–|—/)
        .map((s) => s.trim());
      return {
        degree: parts[0] || "Degree",
        institution: parts[1] || lines[1] || "",
        stream: lines[1] && parts[1] ? lines[1] : undefined,
        startDate,
        endDate,
      };
    });
}

function parseCertifications(
  value: unknown,
  category: Certification["category"],
): Certification[] {
  return splitList(value).map((name) => ({ name, category }));
}

function parseLanguages(value: unknown): Language[] {
  return splitList(value).map((item) => {
    const [name, proficiency = "Professional"] = item
      .split(/:|-–—/)
      .map((s) => s.trim());
    return { name, proficiency };
  });
}

/**
 * Maps Google Forms / Sheets / intake payloads into a partial resume shape.
 * Technology resolution happens in the agent (not here).
 */
export function mapGoogleFormPayload(body: Record<string, unknown>): {
  source: ResumeInput["source"];
  fullName: string;
  headline?: string;
  contact: ResumeInput["contact"];
  expertise: string[];
  certifications: Certification[];
  languages: Language[];
  workExperience: WorkExperience[];
  education: Education[];
  additionalWorks: { description: string }[];
  notes?: string;
  themeHint?: string;
} {
  const get = (...keys: string[]) => {
    for (const key of keys) {
      if (body[key] != null && asString(body[key])) return body[key];
      const found = Object.entries(body).find(
        ([k]) => k.toLowerCase().trim() === key.toLowerCase(),
      );
      if (found) return found[1];
    }
    return "";
  };

  const phones = splitList(
    get("phones", "Phone", "Phone Numbers", "Mobile", "Mobile / Phone"),
  );
  const mainline = parseCertifications(
    get(
      "certifications_mainline",
      "Main-Line Certifications",
      "Certifications (Main-Line)",
      "Certifications",
    ),
    "mainline",
  );
  const micro = parseCertifications(
    get(
      "certifications_micro",
      "Micro Certifications",
      "Certifications (Micro-Cert)",
    ),
    "micro",
  );
  const other = parseCertifications(
    get("certifications_other", "Other Certifications"),
    "other",
  );

  return {
    source: "google-forms",
    fullName: asString(get("fullName", "Full Name", "Name")),
    headline:
      asString(get("headline", "Headline", "Professional Title")) || undefined,
    contact: {
      phones: phones.length
        ? phones
        : [asString(get("phone", "Phone"))].filter(Boolean),
      email: asString(get("email", "Email", "Email Address")),
      linkedin:
        asString(get("linkedin", "LinkedIn", "LinkedIn URL")) || undefined,
      website:
        asString(get("website", "Website", "Portfolio")) || undefined,
      location:
        asString(get("location", "Location", "City")) || undefined,
    },
    expertise: splitList(
      get("expertise", "Skills", "Expertise", "Technical Skills"),
    ),
    certifications: [...mainline, ...micro, ...other],
    languages: parseLanguages(get("languages", "Languages")),
    workExperience: parseWorkExperience(
      get("workExperience", "Experience", "Work Experience"),
    ),
    education: parseEducation(get("education", "Education")),
    additionalWorks: splitList(
      get(
        "additionalWorks",
        "Additional Works",
        "Projects",
        "Other Experience",
        "Resume / LinkedIn text (paste)",
      ),
    ).map((description) => ({ description })),
    notes: asString(get("notes", "Notes", "Anything else")) || undefined,
    themeHint: asString(
      get(
        "theme",
        "technology",
        "technologyName",
        "Technology",
        "Technology Theme",
        "Resume Theme",
        "Platform",
      ),
    ),
  };
}

export function normalizeFormBody(body: Record<string, unknown>) {
  if (body.fullName || body.source === "form" || body.source === "sample") {
    const workExperience = Array.isArray(body.workExperience)
      ? (body.workExperience as WorkExperience[])
      : parseWorkExperience(body.workExperience || body.experience);
    const education = Array.isArray(body.education)
      ? (body.education as Education[])
      : parseEducation(body.education);
    const certifications = Array.isArray(body.certifications)
      ? (body.certifications as Certification[])
      : [
          ...parseCertifications(body.certifications_mainline, "mainline"),
          ...parseCertifications(body.certifications_micro, "micro"),
          ...parseCertifications(body.certifications_other, "other"),
          ...parseCertifications(body.certifications, "mainline"),
        ];
    const languages = Array.isArray(body.languages)
      ? (body.languages as Language[])
      : parseLanguages(body.languages);

    return {
      source: (body.source as ResumeInput["source"]) || "form",
      fullName: asString(body.fullName),
      headline: asString(body.headline) || undefined,
      contact: {
        phones: Array.isArray((body.contact as { phones?: string[] })?.phones)
          ? (body.contact as { phones: string[] }).phones
          : splitList(
              body.phones ||
                body.mobile ||
                (body.contact as { phones?: string })?.phones,
            ),
        email:
          asString((body.contact as { email?: string })?.email) ||
          asString(body.email),
        linkedin:
          asString((body.contact as { linkedin?: string })?.linkedin) ||
          asString(body.linkedin) ||
          undefined,
        website:
          asString((body.contact as { website?: string })?.website) ||
          asString(body.website) ||
          undefined,
        location:
          asString((body.contact as { location?: string })?.location) ||
          asString(body.location) ||
          undefined,
      },
      expertise: Array.isArray(body.expertise)
        ? (body.expertise as string[]).map(String)
        : splitList(body.expertise || body.skills),
      certifications,
      languages,
      workExperience,
      education,
      additionalWorks: Array.isArray(body.additionalWorks)
        ? (body.additionalWorks as { description: string }[])
        : splitList(body.additionalWorks).map((description) => ({
            description,
          })),
      notes: asString(body.notes) || undefined,
      themeHint: asString(
        body.theme ||
          body.technology ||
          body.technologyName ||
          body.Technology,
      ),
    };
  }

  return mapGoogleFormPayload(body);
}
