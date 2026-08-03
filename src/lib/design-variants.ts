import type { DesignTemplateId, Technology } from "./types";
import type { LayoutStyle } from "./types";
import { LAYOUT_OPTIONS } from "./default-technologies";

export const DESIGN_TEMPLATES: {
  id: DesignTemplateId;
  name: string;
  pitch: string;
}[] = [
  {
    id: "classic",
    name: "Platform Classic",
    pitch: "Sidebar navigator — baseline product system",
  },
  {
    id: "signal",
    name: "Orbital Mast",
    pitch: "Procedural orbit geometry + impact rails",
  },
  {
    id: "mosaic",
    name: "Lattice Grid",
    pitch: "Skewed tessellation modules (hard to clone)",
  },
  {
    id: "horizon",
    name: "Spectrum Ribbon",
    pitch: "Angled full-bleed story bands",
  },
  {
    id: "atelier",
    name: "Folio Split",
    pitch: "Editorial asymmetric glyph column",
  },
  {
    id: "pulse",
    name: "Synapse Rail",
    pitch: "Neural spine + stacked delivery nodes",
  },
];

export function nextDesignTemplate(
  current?: DesignTemplateId,
): DesignTemplateId {
  const order = DESIGN_TEMPLATES.map((t) => t.id);
  const idx = current ? order.indexOf(current) : -1;
  return order[(idx + 1) % order.length];
}

/** Layout accent remaps the full palette so the dropdown visibly changes every template. */
export function layoutAccentPalette(
  layout: LayoutStyle,
  base: Technology["colors"],
): Technology["colors"] {
  switch (layout) {
    case "cloud-blue":
      return {
        background: "#032d60",
        surface: "#014486",
        accent: "#1b96ff",
        accentText: "#032d60",
        text: "#f4f6f9",
        muted: "#b0c4de",
        cardHeader: "#0176d3",
        cardBody: "#0b3a6e",
        sidebar: "#023248",
      };
    case "console-dark":
      return {
        background: "#16191f",
        surface: "#232f3e",
        accent: "#ff9900",
        accentText: "#16191f",
        text: "#fafafa",
        muted: "#d5dbdb",
        cardHeader: "#ec7211",
        cardBody: "#2d3744",
        sidebar: "#0f141a",
      };
    case "portal-light":
      return {
        background: "#f3f2f1",
        surface: "#ffffff",
        accent: "#0078d4",
        accentText: "#ffffff",
        text: "#201f1e",
        muted: "#605e5c",
        cardHeader: "#deecf9",
        cardBody: "#ffffff",
        sidebar: "#eff6fc",
      };
    case "modern-clean":
      return {
        background: "#f7f4ef",
        surface: "#ffffff",
        accent: "#0f766e",
        accentText: "#f0fdfa",
        text: "#1c1917",
        muted: "#57534e",
        cardHeader: "#ccfbf1",
        cardBody: "#fafaf9",
        sidebar: "#ecfdf5",
      };
    case "terminal":
      return {
        background: "#0b1220",
        surface: "#111827",
        accent: "#34d399",
        accentText: "#052e1c",
        text: "#e5e7eb",
        muted: "#9ca3af",
        cardHeader: "#065f46",
        cardBody: "#1a2332",
        sidebar: "#030712",
      };
    case "platform-dark":
    default:
      return {
        ...base,
        background: base.background || "#18181f",
        surface: base.surface || "#2a2a33",
        accent: base.accent || "#86ee78",
        accentText: base.accentText || "#0c1220",
        text: base.text || "#f5f5f5",
        muted: base.muted || "#cfcfcf",
        cardHeader: base.cardHeader || "#6fa894",
        cardBody: base.cardBody || "#d9d9d9",
        sidebar: base.sidebar || "#1f1f27",
      };
  }
}

/** Alternate color palettes derived from a technology's base colors. */
export function colorVariant(
  base: Technology["colors"],
  index: number,
): Technology["colors"] {
  const variants: Technology["colors"][] = [
    base,
    {
      ...base,
      accent: shiftHex(base.accent, 40),
      cardHeader: shiftHex(base.cardHeader, 25),
      background: shiftHex(base.background, -10),
      sidebar: shiftHex(base.sidebar, -8),
    },
    {
      ...base,
      accent: shiftHex(base.accent, -50),
      cardHeader: shiftHex(base.accent, -20),
      cardBody: "#f4f4f1",
      background: shiftHex(base.background, 18),
      surface: shiftHex(base.surface, 12),
    },
    {
      ...base,
      background: invertish(base.background),
      surface: invertish(base.surface),
      sidebar: invertish(base.sidebar),
      text: invertish(base.text),
      muted: shiftHex(invertish(base.text), 30),
      cardBody: invertish(base.cardBody),
      cardHeader: base.accent,
      accentText: base.background,
    },
  ];
  return variants[((index % variants.length) + variants.length) % variants.length];
}

export function nextLayout(
  current: LayoutStyle,
  used: LayoutStyle[] = [],
): LayoutStyle {
  const order = LAYOUT_OPTIONS.map((o) => o.id);
  const pool = order.filter((l) => l !== current && !used.includes(l));
  if (pool.length) return pool[0];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0").slice(0, 6);
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

function shiftHex(hex: string, amount: number) {
  try {
    const { r, g, b } = hexToRgb(hex || "#888888");
    return rgbToHex(r + amount, g + amount * 0.6, b - amount * 0.4);
  } catch {
    return hex;
  }
}

function invertish(hex: string) {
  try {
    const { r, g, b } = hexToRgb(hex || "#888888");
    return rgbToHex(255 - r, 255 - g, 255 - b);
  } catch {
    return hex;
  }
}
