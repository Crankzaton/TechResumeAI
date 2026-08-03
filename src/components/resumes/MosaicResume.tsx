import type { ResumeData } from "@/lib/types";
import { buildDesignDna, extractImpactMetrics } from "@/lib/design-dna";
import { MotifCanvas } from "./MotifCanvas";
import { SignatureSeal } from "./SignatureSeal";
import { allCerts, ContactLine, ImpactStrip, MonoBadge, themeVars } from "./shared";

/** Lattice Grid — asymmetric tessellation recruiters can't rebuild in Canva. */
export function MosaicResume({ data }: { data: ResumeData }) {
  const dna = buildDesignDna(data);
  const certs = allCerts(data);
  const metrics = extractImpactMetrics(data);

  return (
    <article className="tpl mosaic proprietary" style={themeVars(data)} data-template="mosaic">
      <div className="mosaic-motif-layer">
        <MotifCanvas dna={dna} accent={data.themeColors.accent} muted={data.themeColors.muted} />
      </div>

      <header className="mosaic-top">
        <MonoBadge data={data} />
        <div>
          <p className="mosaic-tech">{data.technologyName} · modular dossier</p>
          <h1>{data.fullName}</h1>
          {data.headline && <p className="mosaic-headline">{data.headline}</p>}
        </div>
        <ContactLine data={data} />
      </header>

      <ImpactStrip metrics={metrics} />

      <div className="mosaic-grid">
        <section className="mosaic-tile mosaic-span-2 mosaic-tile-featured">
          <div className="dna-module-head">
            <h2>Skill modules</h2>
            <span>Λ</span>
          </div>
          <div className="mosaic-tiles">
            {data.expertise.map((s, i) => (
              <div className="mosaic-chip" key={s} data-i={i % 3}>
                <em>{String(i + 1).padStart(2, "0")}</em>
                {s}
              </div>
            ))}
          </div>
        </section>

        {certs.length > 0 && (
          <section className="mosaic-tile mosaic-tile-skew">
            <h2>Certifications</h2>
            <ul>
              {certs.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {data.languages.length > 0 && (
          <section className="mosaic-tile">
            <h2>Languages</h2>
            <ul>
              {data.languages.map((l) => (
                <li key={l.name}>
                  {l.name}
                  <span> — {l.proficiency}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mosaic-tile mosaic-span-2 mosaic-experience">
          <div className="dna-module-head">
            <h2>Experience tesserae</h2>
            <span>Σ</span>
          </div>
          {data.workExperience.map((job, i) => (
            <div className="mosaic-job" key={`${job.company}-${i}`}>
              <div className="mosaic-job-head">
                <h3>
                  {job.title} <span>/ {job.company}</span>
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

        {data.education.map((edu, i) => (
          <section className="mosaic-tile" key={`${edu.institution}-${i}`}>
            <h2>Education</h2>
            <h3>{edu.degree}</h3>
            {edu.stream && <p>{edu.stream}</p>}
            <p>
              {edu.institution}
              <br />
              {edu.startDate} – {edu.endDate}
            </p>
          </section>
        ))}

        {data.additionalWorks.length > 0 && (
          <section className="mosaic-tile mosaic-span-2">
            <h2>Additional</h2>
            <ul>
              {data.additionalWorks.map((w) => (
                <li key={w.description}>{w.description}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <SignatureSeal
        resumeNumber={data.resumeNumber}
        designVersion={data.designVersion}
        dna={dna}
      />
    </article>
  );
}
