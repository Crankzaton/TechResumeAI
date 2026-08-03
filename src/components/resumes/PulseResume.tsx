import type { ResumeData } from "@/lib/types";
import { allCerts, ContactLine, themeVars } from "./shared";

/** Accent spine + stacked horizontal modules — energetic and clear. */
export function PulseResume({ data }: { data: ResumeData }) {
  const certs = allCerts(data);
  return (
    <article className="tpl pulse" style={themeVars(data)} data-template="pulse">
      <div className="pulse-spine" aria-hidden />
      <div className="pulse-body">
        <header className="pulse-header">
          <div>
            <p className="pulse-tech">{data.technologyName}</p>
            <h1>{data.fullName}</h1>
            {data.headline && <p className="pulse-headline">{data.headline}</p>}
          </div>
          <ContactLine data={data} />
        </header>

        <section className="pulse-module">
          <div className="pulse-module-label">01 · Skills</div>
          <div className="pulse-skill-track">
            {data.expertise.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>

        <section className="pulse-module">
          <div className="pulse-module-label">02 · Experience</div>
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
      </div>
    </article>
  );
}
