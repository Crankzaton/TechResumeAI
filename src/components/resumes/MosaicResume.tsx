import type { ResumeData } from "@/lib/types";
import { allCerts, ContactLine, themeVars } from "./shared";

/** Modular tile mosaic — scannable blocks recruiters can skim in seconds. */
export function MosaicResume({ data }: { data: ResumeData }) {
  const certs = allCerts(data);
  return (
    <article className="tpl mosaic" style={themeVars(data)} data-template="mosaic">
      <header className="mosaic-top">
        <div>
          <p className="mosaic-tech">{data.technologyName}</p>
          <h1>{data.fullName}</h1>
          {data.headline && <p className="mosaic-headline">{data.headline}</p>}
        </div>
        <ContactLine data={data} />
      </header>

      <div className="mosaic-grid">
        <section className="mosaic-tile mosaic-span-2">
          <h2>Skill modules</h2>
          <div className="mosaic-tiles">
            {data.expertise.map((s, i) => (
              <div className="mosaic-chip" key={s} data-i={i % 3}>
                {s}
              </div>
            ))}
          </div>
        </section>

        {certs.length > 0 && (
          <section className="mosaic-tile">
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
          <h2>Experience</h2>
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
    </article>
  );
}
