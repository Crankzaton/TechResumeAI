import type { ResumeData } from "@/lib/types";
import { buildDesignDna, extractImpactMetrics } from "@/lib/design-dna";
import { MotifCanvas } from "./MotifCanvas";
import { SignatureSeal } from "./SignatureSeal";
import { allCerts, ContactLine, ImpactStrip, MonoBadge, themeVars } from "./shared";

/** Orbital Mast — proprietary hero geometry + modular impact rails. */
export function SignalResume({ data }: { data: ResumeData }) {
  const dna = buildDesignDna(data);
  const certs = allCerts(data);
  const metrics = extractImpactMetrics(data);

  return (
    <article className="tpl signal proprietary" style={themeVars(data)} data-template="signal">
      <div className="signal-hero-wrap">
        <div className="signal-motif-layer">
          <MotifCanvas dna={dna} accent={data.themeColors.accent} muted={data.themeColors.muted} />
        </div>
        <header className="signal-masthead">
          <MonoBadge data={data} />
          <div className="signal-masthead-main">
            <p className="signal-kicker">Engineered profile · {data.technologyName}</p>
            <h1>{data.fullName}</h1>
            {data.headline && <p className="signal-headline">{data.headline}</p>}
          </div>
          <ContactLine data={data} />
        </header>
      </div>

      <ImpactStrip metrics={metrics} />

      <div className="signal-rail">
        <section className="signal-module">
          <div className="dna-module-head">
            <h2>Capability lattice</h2>
            <span>01</span>
          </div>
          <div className="signal-chips">
            {data.expertise.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
        {certs.length > 0 && (
          <section className="signal-module signal-module-accent">
            <div className="dna-module-head">
              <h2>Verified credentials</h2>
              <span>02</span>
            </div>
            <ul className="signal-cred-list">
              {certs.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section className="signal-experience">
        <div className="signal-section-head">
          <h2>Impact timeline</h2>
          <span>Selected delivery arcs</span>
        </div>
        {data.workExperience.map((job, i) => (
          <div className="signal-role" key={`${job.company}-${i}`}>
            <div className="signal-role-index">{String(i + 1).padStart(2, "0")}</div>
            <div className="signal-role-meta">
              <h3>
                {job.title}
                <em> @ {job.company}</em>
              </h3>
              <span>
                {job.startDate} – {job.endDate}
              </span>
            </div>
            <ul>
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="signal-footer">
        {data.education.map((edu, i) => (
          <div key={`${edu.institution}-${i}`}>
            <strong>
              {edu.degree}
              {edu.stream ? ` · ${edu.stream}` : ""}
            </strong>
            <span>
              {edu.institution} · {edu.startDate}–{edu.endDate}
            </span>
          </div>
        ))}
        {data.languages.length > 0 && (
          <div>
            <strong>Languages</strong>
            <span>
              {data.languages.map((l) => `${l.name} (${l.proficiency})`).join(" · ")}
            </span>
          </div>
        )}
      </footer>
      <SignatureSeal
        resumeNumber={data.resumeNumber}
        designVersion={data.designVersion}
        dna={dna}
      />
    </article>
  );
}
