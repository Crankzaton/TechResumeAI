/**
 * AI enhance pass — takes intake details, rewrites copy, and returns a
 * polished full template (structure + typography + palette + section order).
 * Deterministic (no external API key required).
 */
import type {
  ChipStyle,
  DesignTemplateId,
  LayoutStyle,
  ResumeData,
  ResumeSectionConfig,
  ResumeStyleSettings,
} from "./types";
import { nextDesignTemplate, nextLayout } from "./design-variants";
import { polishBullets, polishHeadline } from "./content-polish";
import { ensureSectionLayout } from "./resume-sections";

const TEMPLATE_LOOK: Record<
  DesignTemplateId,
  {
    chipStyle: ChipStyle;
    style: Partial<ResumeStyleSettings>;
    preferredLayouts: LayoutStyle[];
  }
> = {
  classic: {
    chipStyle: "soft",
    preferredLayouts: ["platform-dark", "portal-light"],
    style: {
      bodyFont: "sans",
      headingFont: "display",
      nameSize: 34,
      sectionTitleSize: 11,
      bodySize: 13,
      sectionGap: 12,
      sectionPadding: 12,
      headerAlign: "split",
      showSectionRules: true,
      denserBullets: false,
    },
  },
  signal: {
    chipStyle: "outline",
    preferredLayouts: ["console-dark", "cloud-blue"],
    style: {
      bodyFont: "sans",
      headingFont: "mono",
      nameSize: 30,
      sectionTitleSize: 10,
      bodySize: 12,
      sectionGap: 10,
      sectionPadding: 10,
      headerAlign: "left",
      showSectionRules: true,
      denserBullets: true,
    },
  },
  mosaic: {
    chipStyle: "accent",
    preferredLayouts: ["modern-clean", "portal-light"],
    style: {
      bodyFont: "sans",
      headingFont: "sans",
      nameSize: 28,
      sectionTitleSize: 10,
      bodySize: 12,
      sectionGap: 8,
      sectionPadding: 10,
      headerAlign: "center",
      showSectionRules: false,
      denserBullets: true,
    },
  },
  horizon: {
    chipStyle: "contrast",
    preferredLayouts: ["cloud-blue", "console-dark"],
    style: {
      bodyFont: "sans",
      headingFont: "display",
      nameSize: 38,
      sectionTitleSize: 12,
      bodySize: 13,
      sectionGap: 14,
      sectionPadding: 12,
      headerAlign: "split",
      showSectionRules: false,
      denserBullets: false,
    },
  },
  atelier: {
    chipStyle: "soft",
    preferredLayouts: ["modern-clean", "portal-light"],
    style: {
      bodyFont: "serif",
      headingFont: "display",
      nameSize: 40,
      sectionTitleSize: 11,
      bodySize: 13,
      sectionGap: 14,
      sectionPadding: 14,
      headerAlign: "left",
      showSectionRules: false,
      denserBullets: false,
    },
  },
  pulse: {
    chipStyle: "outline",
    preferredLayouts: ["terminal", "console-dark"],
    style: {
      bodyFont: "mono",
      headingFont: "sans",
      nameSize: 28,
      sectionTitleSize: 10,
      bodySize: 12,
      sectionGap: 10,
      sectionPadding: 10,
      headerAlign: "split",
      showSectionRules: true,
      denserBullets: true,
    },
  },
};

/** Recruiter-first order with breathing room via spacers. */
const IMPACT_BLOCKS: ResumeSectionConfig["kind"][][] = [
  ["header"],
  ["impact", "summary"],
  ["skills", "tools"],
  ["experience"],
  ["projects"],
  ["certs", "education", "languages"],
  ["awards", "interests", "additional", "custom"],
];

export function enhanceResumeContent(data: ResumeData): {
  patch: Partial<ResumeData>;
  summary: string;
} {
  const tech = data.technologyName;

  let designTemplate = nextDesignTemplate(data.designTemplate);
  designTemplate = nextDesignTemplate(designTemplate);
  const look = TEMPLATE_LOOK[designTemplate];

  const layout =
    look.preferredLayouts.find(
      (l) => l !== data.layout && !(data.previousLayouts || []).includes(l),
    ) ||
    nextLayout(data.layout, data.previousLayouts || []);

  const workExperience = data.workExperience.map((job) => ({
    ...job,
    bullets: amplifyBullets(polishBullets(job.bullets, tech), tech),
  }));

  const summary = rewriteSummary(data.summary, data) || inventSummary(data);
  const headline = polishHeadline(data.headline, tech, data.expertise);

  const sectionLayout = composeBeautifulLayout(ensureSectionLayout(data));

  const styleSettings: ResumeStyleSettings = {
    bodyFont: look.style.bodyFont || "sans",
    headingFont: look.style.headingFont || "display",
    nameSize: look.style.nameSize ?? 32,
    sectionTitleSize: look.style.sectionTitleSize ?? 11,
    bodySize: Math.round(Number(look.style.bodySize ?? 13)),
    sectionGap: look.style.sectionGap ?? 10,
    sectionPadding: look.style.sectionPadding ?? 10,
    headerAlign: look.style.headerAlign || "split",
    showSectionRules: look.style.showSectionRules ?? true,
    denserBullets: look.style.denserBullets ?? false,
  };

  const tplName =
    designTemplate.charAt(0).toUpperCase() + designTemplate.slice(1);

  return {
    patch: {
      summary,
      headline,
      workExperience,
      designTemplate,
      layout,
      chipStyle: look.chipStyle,
      chipColors: undefined,
      styleSettings,
      sectionLayout,
      expertise: prioritizeSkills(data.expertise),
      tools: data.tools?.length ? prioritizeSkills(data.tools) : data.tools,
      designVersion: (data.designVersion || 1) + 1,
      agentLog: [
        ...(data.agentLog || []),
        `AI full template → ${designTemplate} / ${layout}`,
      ],
    },
    summary: `AI built a full ${tplName} template with polished copy, new structure, and typography`,
  };
}

function composeBeautifulLayout(
  sections: ResumeSectionConfig[],
): ResumeSectionConfig[] {
  const byKind = new Map<string, ResumeSectionConfig[]>();
  for (const s of sections) {
    if (s.kind === "spacer") continue; // rebuild spacers intentionally
    const bucket = byKind.get(s.kind) || [];
    bucket.push({ ...s, visible: forceVisible(s) });
    byKind.set(s.kind, bucket);
  }

  const out: ResumeSectionConfig[] = [];
  let spacerN = 0;
  for (let bi = 0; bi < IMPACT_BLOCKS.length; bi++) {
    const kinds = IMPACT_BLOCKS[bi];
    let added = 0;
    for (const kind of kinds) {
      const items = byKind.get(kind) || [];
      for (const item of items) {
        out.push(item);
        added++;
      }
      byKind.delete(kind);
    }
    // Soft spacer between major blocks (not after last)
    if (added > 0 && bi < IMPACT_BLOCKS.length - 1) {
      out.push({
        id: `spacer-ai-${spacerN++}`,
        kind: "spacer",
        title: "Spacer",
        visible: true,
        spacerSize: bi === 0 ? 16 : 20,
      });
    }
  }

  // Any leftover kinds (shouldn't happen often)
  for (const leftovers of byKind.values()) {
    out.push(...leftovers);
  }
  return out;
}

function forceVisible(s: ResumeSectionConfig): boolean {
  if (
    s.kind === "summary" ||
    s.kind === "impact" ||
    s.kind === "skills" ||
    s.kind === "experience" ||
    s.kind === "header"
  ) {
    return true;
  }
  return s.visible;
}

function amplifyBullets(bullets: string[], tech: string): string[] {
  return bullets.map((b) => {
    if (/\d|%|k\+|\bSLA\b|\bSLO\b/i.test(b)) return b;
    if (/^delivered|^led|^owned|^built|^automated|^designed|^improved/i.test(b))
      return b;
    return b.replace(/\.$/, "") + ` — executed within ${tech} delivery scope.`;
  });
}

function rewriteSummary(existing: string | undefined, data: ResumeData): string {
  const yearsHint = data.workExperience.length >= 2 ? "multi-role" : "focused";
  const base = (existing || "").trim();
  if (base.length > 40) {
    const clipped = base.replace(/\s+/g, " ").slice(0, 320);
    if (/specialist|engineer|developer|architect|leader|consultant/i.test(clipped)) {
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
    `${data.technologyName} specialist with strength in ${skills}. ${roleBit} Builds recruiter-ready delivery stories around measurable outcomes`
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function prioritizeSkills(skills: string[]): string[] {
  return [...skills].sort((a, b) => b.length - a.length || a.localeCompare(b));
}

function ensurePeriod(s: string) {
  const t = s.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

export function pickContrastingTemplate(
  current?: DesignTemplateId,
): DesignTemplateId {
  return nextDesignTemplate(nextDesignTemplate(current));
}
