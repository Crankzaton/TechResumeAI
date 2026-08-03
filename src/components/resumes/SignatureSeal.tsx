import type { DesignDna } from "@/lib/design-dna";

/** Subtle authenticity mark — part of the paid deliverable identity. */
export function SignatureSeal({
  resumeNumber,
  designVersion,
  dna,
}: {
  resumeNumber: string;
  designVersion?: number;
  dna: DesignDna;
}) {
  return (
    <div className={`dna-seal dna-seal-${dna.sealStyle}`} aria-hidden>
      <span className="dna-seal-mark">◈</span>
      <span>
        TechResumeAI · {resumeNumber}
        {designVersion ? ` · v${designVersion}` : ""}
      </span>
      <span className="dna-seal-code">DNA-{dna.seed.toString(16).slice(0, 6).toUpperCase()}</span>
    </div>
  );
}
