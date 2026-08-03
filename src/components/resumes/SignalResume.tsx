import type { ResumeData } from "@/lib/types";
import { allCerts, ContactLine, themeVars } from "./shared";

/** Bold horizontal masthead + modular skill/experience rails — recruiter-first. */
export function SignalResume({ data }: { data: ResumeData }) {
  const certs = allCerts(data);
  return (
    <article className="tpl signal" style={themeVars(data)} data-template="signal">
      <header className="signal-masthead">
        <div className="signal-masthead-main">
          <p className="signal-kicker">{data.technologyName} specialist</p>
          <h1>{data.fullName}</h1>
          {data.headline && <p className="signal-headline">{data.headline}</p>}
        </div>
        <ContactLine data={data} />
      </header>

      <div className="signal-rail">
        <section className="signal-module">
          <h2>Core strengths</h2>
          <div className="signal-chips">
            {data.expertise.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
        {certs.length > 0 && (
          <section className="signal-module signal-module-accent">
            <h2>Credentials</h2>
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
          <span>Selected roles</span>
        </div>
        {data.workExperience.map((job, i) => (
          <div className="signal-role" key={`${job.company}-${i}`}>
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
    </article>
  );
}
