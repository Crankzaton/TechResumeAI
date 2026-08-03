import type { ResumeData } from "@/lib/types";

export function AwsResume({ data }: { data: ResumeData }) {
  return (
    <article className="aws-resume" data-theme="aws">
      <header className="aws-header">
        <div>
          <p className="aws-eyebrow">AWS · Professional Profile</p>
          <h1>{data.fullName}</h1>
          {data.headline && <p className="aws-headline">{data.headline}</p>}
        </div>
        <div className="aws-contact">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phones.map((p) => (
            <span key={p}>{p}</span>
          ))}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
        </div>
      </header>

      <div className="aws-body">
        <section className="aws-panel">
          <h2>Core Services & Skills</h2>
          <div className="aws-tags">
            {data.expertise.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>

        <section className="aws-panel">
          <h2>Experience</h2>
          {data.workExperience.map((job, i) => (
            <div className="aws-job" key={`${job.title}-${i}`}>
              <div className="aws-job-top">
                <h3>
                  {job.title} <span>/ {job.company}</span>
                </h3>
                <span className="aws-date">
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

        <div className="aws-split">
          <section className="aws-panel">
            <h2>Certifications</h2>
            <ul>
              {data.certifications.map((c) => (
                <li key={c.name}>{c.name}</li>
              ))}
            </ul>
          </section>
          <section className="aws-panel">
            <h2>Education</h2>
            {data.education.map((edu, i) => (
              <div key={`${edu.degree}-${i}`}>
                <h3>{edu.degree}</h3>
                <p>
                  {edu.institution}
                  <br />
                  {edu.startDate} – {edu.endDate}
                </p>
              </div>
            ))}
            {data.languages.length > 0 && (
              <>
                <h2 style={{ marginTop: "1rem" }}>Languages</h2>
                <ul>
                  {data.languages.map((l) => (
                    <li key={l.name}>
                      {l.name}: {l.proficiency}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
