import type { DesignTemplateId, ResumeData } from "./types";

/**
 * Proprietary Design DNA — parameters derived from Resume ID + technology.
 * Makes each render feel bespoke and hard to recreate in Canva/Word.
 */
export interface DesignDna {
  seed: number;
  angle: number;
  density: number;
  orbitCount: number;
  latticeSkew: number;
  accentShift: number;
  glyphIndex: number;
  bandOffset: number;
  sealStyle: "corner" | "footer" | "spine";
  motif: "orbit" | "lattice" | "spectrum" | "folio" | "synapse" | "platform";
}

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export function buildDesignDna(
  data: Pick<ResumeData, "id" | "resumeNumber" | "technologyName" | "designTemplate">,
): DesignDna {
  const seed = hashSeed(
    `${data.resumeNumber}|${data.id}|${data.technologyName}|${data.designTemplate || "classic"}`,
  );
  const motifMap: Record<DesignTemplateId, DesignDna["motif"]> = {
    classic: "platform",
    signal: "orbit",
    mosaic: "lattice",
    horizon: "spectrum",
    atelier: "folio",
    pulse: "synapse",
  };
  const tpl = data.designTemplate || "classic";
  return {
    seed,
    angle: 8 + (seed % 17),
    density: 4 + (seed % 5),
    orbitCount: 3 + (seed % 4),
    latticeSkew: ((seed % 11) - 5) * 0.8,
    accentShift: seed % 40,
    glyphIndex: seed % 8,
    bandOffset: seed % 24,
    sealStyle: (["corner", "footer", "spine"] as const)[seed % 3],
    motif: motifMap[tpl],
  };
}

/** Extract recruiter-scannable impact metrics from experience bullets. */
export function extractImpactMetrics(data: ResumeData): {
  label: string;
  value: string;
}[] {
  const metrics: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  const re =
    /(\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?[kKmMbB]\+?|\d{2,}\+?)\s*([a-zA-Z][\w\s/-]{2,28})?/g;

  for (const job of data.workExperience) {
    for (const bullet of job.bullets) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(bullet)) && metrics.length < 4) {
        const value = m[1].trim();
        const label = (m[2] || inferLabel(bullet, value)).trim().slice(0, 28);
        const key = `${value}|${label}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        metrics.push({ value, label: label || "impact" });
      }
    }
  }

  if (metrics.length === 0 && data.expertise.length) {
    metrics.push(
      { value: String(data.expertise.length), label: "core skills" },
      {
        value: String(data.workExperience.length),
        label: "roles owned",
      },
      {
        value: String(data.certifications.length || "—"),
        label: "credentials",
      },
    );
  }

  return metrics.slice(0, 4);
}

function inferLabel(bullet: string, value: string): string {
  const cleaned = bullet
    .replace(value, "")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean).slice(-3);
  return words.join(" ") || "result";
}

export function techMonogram(technologyName: string): string {
  const parts = technologyName.replace(/[^a-zA-Z0-9\s/]/g, "").split(/[\s/]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return technologyName.slice(0, 2).toUpperCase();
}
