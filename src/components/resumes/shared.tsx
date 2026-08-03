import type { CSSProperties } from "react";
import type { ResumeData } from "@/lib/types";
import { buildDesignDna, techMonogram } from "@/lib/design-dna";

export function allCerts(data: ResumeData) {
  return data.certifications.map((c) => c.name);
}

export function themeVars(data: ResumeData): CSSProperties {
  const c = data.themeColors;
  const dna = buildDesignDna(data);
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
