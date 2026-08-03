/**
 * Light AI-style content polish for recruiter impact.
 * Turns flat duty lines into stronger delivery statements when needed.
 * Keeps original meaning; never invents employers or dates.
 */
export function polishBullets(bullets: string[], technologyName: string): string[] {
  return bullets.map((raw) => {
    const b = raw.trim().replace(/^[-•*\d.)\s]+/, "");
    if (!b) return raw;
    // Already impactful (has metric or strong verb)
    if (
      /\d/.test(b) ||
      /^(led|owned|built|designed|delivered|automated|reduced|improved|architected|scaled|migrated)/i.test(
        b,
      )
    ) {
      return ensurePeriod(capitalize(b));
    }
    // Soft duty → delivery framing
    if (/^(experience in|expertise in|worked on|responsible for|helped with)/i.test(b)) {
      const rest = b.replace(
        /^(experience in|expertise in|worked on|responsible for|helped with)\s*/i,
        "",
      );
      return ensurePeriod(
        `Delivered ${rest} across ${technologyName} engagements`,
      );
    }
    return ensurePeriod(capitalize(b));
  });
}

export function polishHeadline(
  headline: string | undefined,
  technologyName: string,
  expertise: string[],
): string {
  if (headline && headline.trim().length > 8) return headline.trim();
  const focus = expertise.slice(0, 2).join(" · ");
  return focus
    ? `${technologyName} Specialist · ${focus}`
    : `${technologyName} Professional`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ensurePeriod(s: string) {
  return /[.!?]$/.test(s) ? s : `${s}.`;
}
