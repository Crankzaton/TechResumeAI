import type {
  ResumeData,
  ResumeSectionConfig,
  ResumeStyleSettings,
  SectionKind,
} from "./types";
import { DEFAULT_RESUME_STYLE } from "./types";

const DEFAULT_TITLES: Record<SectionKind, string> = {
  header: "Header",
  summary: "Professional summary",
  impact: "Impact metrics",
  skills: "Skills",
  tools: "Tools & platforms",
  experience: "Work experience",
  projects: "Projects",
  education: "Education",
  certs: "Certifications",
  languages: "Languages",
  awards: "Awards",
  interests: "Interests",
  additional: "Additional",
  custom: "Custom section",
  spacer: "Spacer",
};

export function defaultSectionTitle(kind: SectionKind) {
  return DEFAULT_TITLES[kind];
}

function sid(kind: SectionKind, n = 0) {
  return `${kind}-${n || "0"}`;
}

/** Build initial section layout from resume content. */
export function buildDefaultSectionLayout(
  data: Pick<
    ResumeData,
    | "summary"
    | "expertise"
    | "tools"
    | "workExperience"
    | "projects"
    | "education"
    | "certifications"
    | "languages"
    | "awards"
    | "interests"
    | "additionalWorks"
  >,
): ResumeSectionConfig[] {
  const sections: ResumeSectionConfig[] = [
    { id: sid("header"), kind: "header", title: "Header", visible: true },
    {
      id: sid("summary"),
      kind: "summary",
      title: DEFAULT_TITLES.summary,
      visible: Boolean(data.summary?.trim()),
    },
    { id: sid("impact"), kind: "impact", title: DEFAULT_TITLES.impact, visible: true },
    {
      id: sid("skills"),
      kind: "skills",
      title: DEFAULT_TITLES.skills,
      visible: data.expertise.length > 0,
    },
    {
      id: sid("tools"),
      kind: "tools",
      title: DEFAULT_TITLES.tools,
      visible: (data.tools?.length || 0) > 0,
    },
    {
      id: sid("experience"),
      kind: "experience",
      title: DEFAULT_TITLES.experience,
      visible: data.workExperience.length > 0,
    },
    {
      id: sid("projects"),
      kind: "projects",
      title: DEFAULT_TITLES.projects,
      visible: (data.projects?.length || 0) > 0,
    },
    {
      id: sid("education"),
      kind: "education",
      title: DEFAULT_TITLES.education,
      visible: data.education.length > 0,
    },
    {
      id: sid("certs"),
      kind: "certs",
      title: DEFAULT_TITLES.certs,
      visible: data.certifications.length > 0,
    },
    {
      id: sid("languages"),
      kind: "languages",
      title: DEFAULT_TITLES.languages,
      visible: data.languages.length > 0,
    },
    {
      id: sid("awards"),
      kind: "awards",
      title: DEFAULT_TITLES.awards,
      visible: (data.awards?.length || 0) > 0,
    },
    {
      id: sid("interests"),
      kind: "interests",
      title: DEFAULT_TITLES.interests,
      visible: (data.interests?.length || 0) > 0,
    },
    {
      id: sid("additional"),
      kind: "additional",
      title: DEFAULT_TITLES.additional,
      visible: data.additionalWorks.length > 0,
    },
  ];
  return sections;
}

export function ensureSectionLayout(data: ResumeData): ResumeSectionConfig[] {
  if (data.sectionLayout?.length) return data.sectionLayout;
  return buildDefaultSectionLayout(data);
}

export function ensureStyleSettings(
  data: Pick<ResumeData, "styleSettings">,
): ResumeStyleSettings {
  return { ...DEFAULT_RESUME_STYLE, ...(data.styleSettings || {}) };
}

export function moveSection(
  list: ResumeSectionConfig[],
  id: string,
  dir: -1 | 1,
): ResumeSectionConfig[] {
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) return list;
  const next = idx + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(idx, 1);
  copy.splice(next, 0, item);
  return copy;
}

/** Drop `id` so it sits at `toIndex` (0-based) after removal. */
export function moveSectionTo(
  list: ResumeSectionConfig[],
  id: string,
  toIndex: number,
): ResumeSectionConfig[] {
  const from = list.findIndex((s) => s.id === id);
  if (from < 0) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  const clamped = Math.max(0, Math.min(toIndex, copy.length));
  copy.splice(clamped, 0, item);
  return copy;
}

export function duplicateSection(
  list: ResumeSectionConfig[],
  id: string,
): ResumeSectionConfig[] {
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) return list;
  const src = list[idx];
  if (src.kind === "spacer") {
    const clone: ResumeSectionConfig = {
      ...src,
      id: `spacer-${Date.now().toString(36)}`,
      title: "Spacer",
    };
    const copy = [...list];
    copy.splice(idx + 1, 0, clone);
    return copy;
  }
  const clone: ResumeSectionConfig = {
    ...src,
    id: `${src.kind}-${Date.now().toString(36)}`,
    title: `${src.title} (copy)`,
    kind: src.kind === "header" ? "custom" : src.kind,
    customBody:
      src.customBody ||
      (src.kind === "custom" ? "" : `Duplicated · ${src.title}`),
  };
  if (src.kind !== "custom" && src.kind !== "header") {
    clone.kind = "custom";
  }
  const copy = [...list];
  copy.splice(idx + 1, 0, clone);
  return copy;
}

export function insertSpacerAfter(
  list: ResumeSectionConfig[],
  afterId?: string | null,
  size = 24,
): ResumeSectionConfig[] {
  const spacer: ResumeSectionConfig = {
    id: `spacer-${Date.now().toString(36)}`,
    kind: "spacer",
    title: "Spacer",
    visible: true,
    spacerSize: size,
  };
  if (!afterId) return [...list, spacer];
  const idx = list.findIndex((s) => s.id === afterId);
  if (idx < 0) return [...list, spacer];
  const copy = [...list];
  copy.splice(idx + 1, 0, spacer);
  return copy;
}

export function sectionLabel(kind: SectionKind) {
  return DEFAULT_TITLES[kind];
}
