import type { ResumeData } from "@/lib/types";
import { allCerts, ContactLine, themeVars } from "./shared";

/** Full-width horizontal story bands — cinematic but still readable. */
export function HorizonResume({ data }: { data: ResumeData }) {
  const certs = allCerts(data);
  return (
    <article className="tpl horizon" style={themeVars(data)} data-template="horizon">
      <section className="horizon-band horizon-hero">
        <div>
          <p className="horizon-label">{data.technologyName}</p>
          <h1>{data.fullName}</h1>
          {data.headline && <p className="horizon-tagline">{data.headline}</p>}
        </div>
        <ContactLine data={data} />
      </section>

      <section className="horizon-band horizon-skills">
        <h2>Capabilities</h2>
        <div className="horizon-skill-row">
          {data.expertise.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </section>

      <section className="horizon-band">
        <h2>Professional journey</h2>
        <div className="horizon-roles">
          {data.workExperience.map((job, i) => (
            <div className="horizon-role" key={`${job.company}-${i}`}>
              <div className="horizon-role-top">
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
        </div>
      </section>

      <section className="horizon-band horizon-split">
        <div>
          <h2>Education</h2>
          {data.education.map((edu, i) => (
            <div key={`${edu.institution}-${i}`} className="horizon-edu">
              <strong>{edu.degree}</strong>
              <p>
                {edu.stream ? `${edu.stream} · ` : ""}
                {edu.institution}
              </p>
              <span>
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
          ))}
        </div>
        <div>
          <h2>Proof points</h2>
          <ul className="horizon-proof">
            {certs.map((c) => (
              <li key={c}>{c}</li>
            ))}
            {data.languages.map((l) => (
              <li key={l.name}>
                {l.name}: {l.proficiency}
              </li>
            ))}
            {data.additionalWorks.map((w) => (
              <li key={w.description}>{w.description}</li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
