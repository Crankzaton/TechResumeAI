import type { ThemeMeta } from "./types";

export const THEMES: ThemeMeta[] = [
  {
    id: "servicenow",
    name: "ServiceNow",
    tagline: "Platform navigator aesthetic",
    accent: "#81b5a1",
    background: "#18181f",
    description:
      "Dark instance UI with filter bar, module sidebar, and list-style experience cards — built for ServiceNow consultants and developers.",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    tagline: "Lightning workspace",
    accent: "#00a1e0",
    background: "#16325c",
    description:
      "Cloud-blue Lightning layout with app launcher energy — ideal for Salesforce admins, developers, and consultants.",
  },
  {
    id: "aws",
    name: "AWS",
    tagline: "Console-inspired",
    accent: "#ff9900",
    background: "#232f3e",
    description:
      "AWS console dark palette with orange accents — for cloud architects, DevOps, and Solutions Architects.",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    tagline: "Portal clarity",
    accent: "#0078d4",
    background: "#f3f6fb",
    description:
      "Clean Azure portal light theme with crisp blues — suited for Azure engineers and Microsoft stack specialists.",
  },
];

export function getTheme(id: string): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
