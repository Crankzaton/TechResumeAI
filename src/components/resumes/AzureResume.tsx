import type { ResumeData } from "@/lib/types";

export function AzureResume({ data }: { data: ResumeData }) {
  return (
    <article className="az-resume" data-theme="azure">
      <header className="az-header">
        <div className="az-brand-row">
          <span className="az-badge">Azure</span>
          <span className="az-portal">Professional Resume</span>
        </div>
        <h1>{data.fullName}</h1>
        {data.headline && <p className="az-headline">{data.headline}</p>}
        <div className="az-contact">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phones.map((p) => (
            <span key={p}>{p}</span>
          ))}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
      </header>

      <div className="az-grid">
        <section className="az-card az-span-2">
          <h2>Work Experience</h2>
          {data.workExperience.map((job, i) => (
            <div className="az-job" key={`${job.title}-${i}`}>
              <div className="az-job-top">
                <h3>
                  {job.title} — {job.company}
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

        <section className="az-card">
          <h2>Skills</h2>
          <ul className="az-skills">
            {data.expertise.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <section className="az-card">
          <h2>Certifications</h2>
          <ul>
            {data.certifications.map((c) => (
              <li key={c.name}>{c.name}</li>
            ))}
          </ul>
        </section>

        <section className="az-card">
          <h2>Education</h2>
          {data.education.map((edu, i) => (
            <div key={`${edu.degree}-${i}`}>
              <h3>{edu.degree}</h3>
              {edu.stream && <p>{edu.stream}</p>}
              <p>
                {edu.institution}
                <br />
                {edu.startDate} – {edu.endDate}
              </p>
            </div>
          ))}
        </section>

        <section className="az-card">
          <h2>Languages & More</h2>
          <ul>
            {data.languages.map((l) => (
              <li key={l.name}>
                {l.name} ({l.proficiency})
              </li>
            ))}
          </ul>
          {data.additionalWorks.length > 0 && (
            <ul style={{ marginTop: "0.75rem" }}>
              {data.additionalWorks.map((w) => (
                <li key={w.description}>{w.description}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
