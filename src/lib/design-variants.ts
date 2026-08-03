import type { LayoutStyle, Technology } from "./types";
import { LAYOUT_OPTIONS } from "./default-technologies";

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
