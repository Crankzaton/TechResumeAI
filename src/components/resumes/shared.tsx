import type { CSSProperties } from "react";
import type { ChipStyle, ResumeData, ResumeFontId } from "@/lib/types";
import { buildDesignDna, techMonogram } from "@/lib/design-dna";
import { ensureStyleSettings } from "@/lib/resume-sections";

export function allCerts(data: ResumeData) {
  return data.certifications.map((c) => c.name);
}

function fontStack(id: ResumeFontId): string {
  switch (id) {
    case "serif":
      return 'Georgia, "Times New Roman", serif';
    case "mono":
      return 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    case "display":
      return 'var(--font-display), Fraunces, Georgia, serif';
    case "sans":
    default:
      return 'var(--font-body), "Source Sans 3", "Segoe UI", sans-serif';
  }
}

function chipVars(
  style: ChipStyle | undefined,
  c: ResumeData["themeColors"],
  override?: ResumeData["chipColors"],
): Record<string, string> {
  if (override?.background || override?.text) {
    return {
      ["--r-chip-bg"]: override.background || c.surface,
      ["--r-chip-text"]: override.text || c.text,
    };
  }
  const mode = style || "soft";
  if (mode === "accent") {
    return {
      ["--r-chip-bg"]: c.accent,
      ["--r-chip-text"]: c.accentText,
    };
  }
  if (mode === "outline") {
    return {
      ["--r-chip-bg"]: "transparent",
      ["--r-chip-text"]: c.text,
    };
  }
  if (mode === "contrast") {
    return {
      ["--r-chip-bg"]: c.cardBody,
      ["--r-chip-text"]: isLight(c.cardBody) ? "#111827" : c.text,
    };
  }
  return {
    ["--r-chip-bg"]: isLight(c.background)
      ? c.cardBody
      : `color-mix(in srgb, ${c.surface} 70%, ${c.accent} 30%)`,
    ["--r-chip-text"]: c.text,
  };
}

function isLight(hex: string) {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

export function themeVars(data: ResumeData): CSSProperties {
  const c = data.themeColors;
  const dna = buildDesignDna(data);
  const s = ensureStyleSettings(data);
  return {
    ["--r-bg" as string]: c.background,
    ["--r-surface" as string]: c.surface,
    ["--r-accent" as string]: c.accent,
    ["--r-accent-text" as string]: c.accentText,
    ["--r-text" as string]: c.text,
    ["--r-muted" as string]: c.muted,
    ["--r-card-h" as string]: c.cardHeader,
    ["--r-card-b" as string]: c.cardBody,
    ["--r-sidebar" as string]: c.sidebar,
    ["--dna-angle" as string]: `${dna.angle}deg`,
    ["--dna-skew" as string]: `${dna.latticeSkew}deg`,
    ["--dna-band" as string]: `${dna.bandOffset}px`,
    ["--r-font-body" as string]: fontStack(s.bodyFont),
    ["--r-font-heading" as string]: fontStack(s.headingFont),
    ["--r-name-size" as string]: `${s.nameSize}px`,
    ["--r-section-title-size" as string]: `${s.sectionTitleSize}px`,
    ["--r-body-size" as string]: `${s.bodySize}px`,
    ["--r-section-gap" as string]: `${s.sectionGap}px`,
    ["--r-section-pad" as string]: `${s.sectionPadding}px`,
    ...chipVars(data.chipStyle, c, data.chipColors),
  };
}

export function ContactLine({ data }: { data: ResumeData }) {
  const bits = [
    data.contact.email,
    ...data.contact.phones.filter(Boolean),
    data.contact.linkedin?.replace(/^https?:\/\//, ""),
    data.contact.location,
    data.contact.website,
  ].filter(Boolean);
  return (
    <div className="tpl-contact">
      {bits.map((b) => (
        <span key={String(b)}>{b}</span>
      ))}
    </div>
  );
}

export function MonoBadge({ data }: { data: ResumeData }) {
  return (
    <div className="dna-mono" aria-hidden>
      <span>{techMonogram(data.technologyName)}</span>
      <em>{data.technologyName}</em>
    </div>
  );
}

export function ImpactStrip({
  metrics,
}: {
  metrics: { label: string; value: string }[];
}) {
  if (!metrics.length) return null;
  return (
    <div className="dna-impact">
      {metrics.map((m) => (
        <div key={`${m.value}-${m.label}`} className="dna-impact-cell">
          <strong>{m.value}</strong>
          <span>{m.label}</span>
        </div>
      ))}
    </div>
  );
}
