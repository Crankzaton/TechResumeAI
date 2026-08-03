import type { ResumeData } from "@/lib/types";

export function SalesforceResume({ data }: { data: ResumeData }) {
  return (
    <article className="sf-resume" data-theme="salesforce">
      <header className="sf-header">
        <div className="sf-cloud" aria-hidden />
        <div>
          <p className="sf-eyebrow">Salesforce Resume</p>
          <h1>{data.fullName}</h1>
          {data.headline && <p className="sf-headline">{data.headline}</p>}
        </div>
        <div className="sf-contact">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phones.map((p) => (
            <span key={p}>{p}</span>
          ))}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
        </div>
      </header>

      <div className="sf-grid">
        <aside className="sf-aside">
          <section>
            <h2>Skills</h2>
            <div className="sf-chips">
              {data.expertise.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </section>
          <section>
            <h2>Certifications</h2>
            <ul>
              {data.certifications.map((c) => (
                <li key={c.name}>{c.name}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Languages</h2>
            <ul>
              {data.languages.map((l) => (
                <li key={l.name}>
                  {l.name} — {l.proficiency}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="sf-main">
          <section>
            <h2>Experience</h2>
            {data.workExperience.map((job, i) => (
              <div className="sf-job" key={`${job.title}-${i}`}>
                <div className="sf-job-top">
                  <h3>
                    {job.title} · {job.company}
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

          <section>
            <h2>Education</h2>
            {data.education.map((edu, i) => (
              <div key={`${edu.degree}-${i}`} className="sf-edu">
                <h3>
                  {edu.degree}
                  {edu.stream ? ` — ${edu.stream}` : ""}
                </h3>
                <p>
                  {edu.institution} · {edu.startDate} – {edu.endDate}
                </p>
              </div>
            ))}
          </section>

          {data.additionalWorks.length > 0 && (
            <section>
              <h2>Additional</h2>
              <ul>
                {data.additionalWorks.map((w) => (
                  <li key={w.description}>{w.description}</li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </article>
  );
}
