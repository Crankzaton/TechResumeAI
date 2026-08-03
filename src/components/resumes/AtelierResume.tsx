import type { ResumeData } from "@/lib/types";
import { buildDesignDna, extractImpactMetrics } from "@/lib/design-dna";
import { MotifCanvas } from "./MotifCanvas";
import { SignatureSeal } from "./SignatureSeal";
import { allCerts, ContactLine, ImpactStrip, MonoBadge, themeVars } from "./shared";

/** Folio Split — editorial asymmetric composition with glyph column. */
export function AtelierResume({ data }: { data: ResumeData }) {
  const dna = buildDesignDna(data);
  const certs = allCerts(data);
  const metrics = extractImpactMetrics(data);

  return (
    <article className="tpl atelier proprietary" style={themeVars(data)} data-template="atelier">
      <div className="atelier-frame">
        <aside className="atelier-aside">
          <MonoBadge data={data} />
          <p className="atelier-mark">{data.technologyName}</p>
          <ContactLine data={data} />
          <div className="atelier-motif-mini">
            <MotifCanvas dna={dna} accent={data.themeColors.accent} muted={data.themeColors.muted} />
          </div>
          <section>
            <h2>Toolkit</h2>
            <ol className="atelier-tools">
              {data.expertise.map((s, i) => (
                <li key={s}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
          {certs.length > 0 && (
            <section>
              <h2>Certified</h2>
              <ul>
                {certs.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <main className="atelier-main">
          <header>
            <h1>{data.fullName}</h1>
            {data.headline && <p>{data.headline}</p>}
          </header>

          <ImpactStrip metrics={metrics} />

          <section>
            <div className="dna-module-head">
              <h2>Selected work</h2>
              <span>folio</span>
            </div>
            {data.workExperience.map((job, i) => (
              <div className="atelier-job" key={`${job.company}-${i}`}>
                <div className="atelier-job-top">
                  <h3>
                    {job.title}
                    <span>{job.company}</span>
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

          <section className="atelier-bottom">
            {data.education.map((edu, i) => (
              <div key={`${edu.institution}-${i}`}>
                <h2>Education</h2>
                <strong>{edu.degree}</strong>
                <p>
                  {edu.institution}
                  {edu.stream ? ` · ${edu.stream}` : ""}
                </p>
                <span>
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
            {data.languages.length > 0 && (
              <div>
                <h2>Languages</h2>
                <p>
                  {data.languages
                    .map((l) => `${l.name} (${l.proficiency})`)
                    .join(" · ")}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
      <SignatureSeal
        resumeNumber={data.resumeNumber}
        designVersion={data.designVersion}
        dna={dna}
      />
    </article>
  );
}
