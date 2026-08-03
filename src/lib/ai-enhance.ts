/**
 * AI enhance pass — rewrites copy, picks a fresh structural template,
 * and reorders sections for recruiter impact. Deterministic (no external API).
 */
import type { DesignTemplateId, ResumeData, ResumeSectionConfig } from "./types";
import { nextDesignTemplate } from "./design-variants";
import { polishBullets, polishHeadline } from "./content-polish";
import { ensureSectionLayout } from "./resume-sections";

const IMPACT_ORDER: ResumeSectionConfig["kind"][] = [
  "header",
  "impact",
  "summary",
  "skills",
  "tools",
  "experience",
  "projects",
  "certs",
  "education",
  "languages",
  "awards",
  "interests",
  "additional",
  "custom",
  "spacer",
];

export function enhanceResumeContent(data: ResumeData): {
  patch: Partial<ResumeData>;
  summary: string;
} {
  const tech = data.technologyName;
  const workExperience = data.workExperience.map((job) => ({
    ...job,
    bullets: amplifyBullets(polishBullets(job.bullets, tech), tech),
  }));

  const summary =
    rewriteSummary(data.summary, data) ||
    inventSummary(data);

  const headline = polishHeadline(data.headline, tech, data.expertise);

  // Jump at least two templates away so the structure clearly changes
  let designTemplate = nextDesignTemplate(data.designTemplate);
  designTemplate = nextDesignTemplate(designTemplate);

  const sectionLayout = reorderForImpact(ensureSectionLayout(data));

  // Ensure summary/impact/skills visible after enhance
  const withVisibility = sectionLayout.map((s) => {
    if (s.kind === "summary" || s.kind === "impact" || s.kind === "skills") {
      return { ...s, visible: true };
    }
    return s;
  });

  return {
    patch: {
      summary,
      headline,
      workExperience,
      designTemplate,
      sectionLayout: withVisibility,
      expertise: prioritizeSkills(data.expertise),
      designVersion: (data.designVersion || 1) + 1,
      agentLog: [
        ...(data.agentLog || []),
        `AI enhance → ${designTemplate} + impact rewrite`,
      ],
    },
    summary: `AI enhanced copy + switched to a new structural layout`,
  };
}

function amplifyBullets(bullets: string[], tech: string): string[] {
  return bullets.map((b) => {
    if (/\d|%|k\+|\bSLA\b|\bSLO\b/i.test(b)) return b;
    if (/^delivered|^led|^owned|^built|^automated/i.test(b)) return b;
    // Lift soft lines without inventing fake metrics
    return b.replace(/\.$/, "") + ` — executed within ${tech} delivery scope.`;
  });
}

function rewriteSummary(existing: string | undefined, data: ResumeData): string {
  const skills = data.expertise.slice(0, 4).join(", ");
  const yearsHint = data.workExperience.length >= 2 ? "multi-role" : "focused";
  const base = (existing || "").trim();
  if (base.length > 40) {
    // Tighten + frame for recruiters
    const clipped = base.replace(/\s+/g, " ").slice(0, 280);
    if (/specialist|engineer|developer|architect|leader/i.test(clipped)) {
      return ensurePeriod(clipped);
    }
    return ensurePeriod(
      `${data.technologyName} ${yearsHint} professional. ${clipped}`,
    );
  }
  return inventSummary(data);
}

function inventSummary(data: ResumeData): string {
  const skills = data.expertise.slice(0, 3).join(", ") || data.technologyName;
  const latest = data.workExperience[0];
  const roleBit = latest
    ? `Recently ${latest.title} at ${latest.company}.`
    : "";
  return ensurePeriod(
    `${data.technologyName} specialist with strength in ${skills}. ${roleBit} Builds recruiter-ready delivery stories around measurable outcomes`.replace(
      /\s+/g,
      " ",
    ).trim(),
  );
}

function prioritizeSkills(skills: string[]): string[] {
  // Stable “AI” shuffle: move longer / more specific skills first
  return [...skills].sort((a, b) => b.length - a.length || a.localeCompare(b));
}

function reorderForImpact(sections: ResumeSectionConfig[]): ResumeSectionConfig[] {
  const rank = (kind: string) => {
    const i = IMPACT_ORDER.indexOf(kind as ResumeSectionConfig["kind"]);
    return i < 0 ? 99 : i;
  };
  return [...sections].sort((a, b) => rank(a.kind) - rank(b.kind));
}

function ensurePeriod(s: string) {
  const t = s.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

export function pickContrastingTemplate(
  current?: DesignTemplateId,
): DesignTemplateId {
  // Skip one so adjacent clicks don't feel like a mild variant
  return nextDesignTemplate(nextDesignTemplate(current));
}
