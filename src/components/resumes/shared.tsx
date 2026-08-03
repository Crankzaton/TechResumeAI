import type { CSSProperties } from "react";
import type { ResumeData } from "@/lib/types";

export function allCerts(data: ResumeData) {
  return data.certifications.map((c) => c.name);
}

export function themeVars(data: ResumeData): CSSProperties {
  const c = data.themeColors;
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
