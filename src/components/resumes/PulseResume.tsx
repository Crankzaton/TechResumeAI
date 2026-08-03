import type { ResumeData } from "@/lib/types";
import { buildDesignDna, extractImpactMetrics } from "@/lib/design-dna";
import { MotifCanvas } from "./MotifCanvas";
import { SignatureSeal } from "./SignatureSeal";
import { allCerts, ContactLine, ImpactStrip, MonoBadge, themeVars } from "./shared";

/** Synapse Rail — neural spine + stacked proprietary modules. */
export function PulseResume({ data }: { data: ResumeData }) {
  const dna = buildDesignDna(data);
  const certs = allCerts(data);
  const metrics = extractImpactMetrics(data);

  return (
    <article className="tpl pulse proprietary" style={themeVars(data)} data-template="pulse">
      <div className="pulse-spine" aria-hidden />
      <div className="pulse-body">
        <div className="pulse-motif-layer">
          <MotifCanvas dna={dna} accent={data.themeColors.accent} muted={data.themeColors.muted} />
        </div>

        <header className="pulse-header">
          <MonoBadge data={data} />
          <div>
            <p className="pulse-tech">{data.technologyName} · synapse dossier</p>
            <h1>{data.fullName}</h1>
            {data.headline && <p className="pulse-headline">{data.headline}</p>}
          </div>
          <ContactLine data={data} />
        </header>

        <ImpactStrip metrics={metrics} />

        <section className="pulse-module">
          <div className="pulse-module-label">01 · Skills graph</div>
          <div className="pulse-skill-track">
            {data.expertise.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>

        <section className="pulse-module">
          <div className="pulse-module-label">02 · Delivery nodes</div>
          {data.workExperience.map((job, i) => (
            <div className="pulse-job" key={`${job.company}-${i}`}>
              <div className="pulse-job-top">
                <h3>
                  {job.title} <span>— {job.company}</span>
                </h3>
                <em>
                  {job.startDate} – {job.endDate}
                </em>
              </div>
              <ul>
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <div className="pulse-row">
          <section className="pulse-module">
            <div className="pulse-module-label">03 · Education</div>
            {data.education.map((edu, i) => (
              <div key={`${edu.institution}-${i}`}>
                <h3>{edu.degree}</h3>
                <p>
                  {edu.stream ? `${edu.stream} · ` : ""}
                  {edu.institution}
                </p>
                <span>
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </section>
          <section className="pulse-module">
            <div className="pulse-module-label">04 · Credentials</div>
            <ul>
              {certs.map((c) => (
                <li key={c}>{c}</li>
              ))}
              {data.languages.map((l) => (
                <li key={l.name}>
                  {l.name} ({l.proficiency})
                </li>
              ))}
            </ul>
          </section>
        </div>
        <SignatureSeal
          resumeNumber={data.resumeNumber}
          designVersion={data.designVersion}
          dna={dna}
        />
      </div>
    </article>
  );
}
