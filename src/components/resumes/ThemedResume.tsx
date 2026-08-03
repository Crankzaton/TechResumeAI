import type { ResumeData } from "@/lib/types";

function certs(
  data: ResumeData,
  category: "mainline" | "micro" | "other",
) {
  return data.certifications.filter((c) => (c.category ?? "mainline") === category);
}

export function ThemedResume({ data }: { data: ResumeData }) {
  const c = data.themeColors;
  const style = {
    ["--r-bg" as string]: c.background,
    ["--r-surface" as string]: c.surface,
    ["--r-accent" as string]: c.accent,
    ["--r-accent-text" as string]: c.accentText,
    ["--r-text" as string]: c.text,
    ["--r-muted" as string]: c.muted,
    ["--r-card-h" as string]: c.cardHeader,
    ["--r-card-b" as string]: c.cardBody,
    ["--r-sidebar" as string]: c.sidebar,
  } as React.CSSProperties;

  const mainline = certs(data, "mainline");
  const micro = certs(data, "micro");
  const other = certs(data, "other");
  const allCerts = data.certifications;

  return (
    <article
      className={`themed-resume layout-${data.layout}`}
      style={style}
      data-tech={data.technologyName}
    >
      <div className="tr-accent-edge" aria-hidden />

      <header className="tr-header">
        <div>
          <p className="tr-tech-label">{data.technologyName}</p>
          <h1 className="tr-name">{data.fullName}</h1>
          {data.headline && <p className="tr-headline">{data.headline}</p>}
        </div>
        <div className="tr-contact">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phones.filter(Boolean).map((p) => (
            <span key={p}>{p}</span>
          ))}
          {data.contact.linkedin && (
            <span>{data.contact.linkedin.replace(/^https?:\/\//, "")}</span>
          )}
          {data.contact.location && <span>{data.contact.location}</span>}
          {data.contact.website && <span>{data.contact.website}</span>}
        </div>
      </header>

      <div className="tr-body">
        <aside className="tr-aside">
          {data.layout === "platform-dark" && (
            <div className="tr-filter">
              <span>▾ Filter</span>
              <span className="tr-pin">◉</span>
            </div>
          )}

          {data.expertise.length > 0 && (
            <section>
              <h2>Expertise</h2>
              <ul>
                {data.expertise.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {mainline.length > 0 && (
            <section>
              <h2>Certifications</h2>
              <ul>
                {mainline.map((item) => (
                  <li key={item.name}>{item.name}</li>
                ))}
              </ul>
            </section>
          )}

          {micro.length > 0 && (
            <section>
              <h2>Micro-certs</h2>
              <ul>
                {micro.map((item) => (
                  <li key={item.name}>{item.name}</li>
                ))}
              </ul>
            </section>
          )}

          {other.length > 0 && (
            <section>
              <h2>Other certs</h2>
              <ul>
                {other.map((item) => (
                  <li key={item.name}>{item.name}</li>
                ))}
              </ul>
            </section>
          )}

          {mainline.length === 0 &&
            micro.length === 0 &&
            other.length === 0 &&
            allCerts.length > 0 && (
              <section>
                <h2>Certifications</h2>
                <ul>
                  {allCerts.map((item) => (
                    <li key={item.name}>{item.name}</li>
                  ))}
                </ul>
              </section>
            )}

          {data.languages.length > 0 && (
            <section>
              <h2>Languages</h2>
              <ul>
                {data.languages.map((l) => (
                  <li key={l.name}>
                    <strong>{l.name}</strong>
                    <span className="tr-muted"> — {l.proficiency}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <main className="tr-main">
          {data.workExperience.length > 0 && (
            <div className="tr-section">
              <div className="tr-pill">Work Experience</div>
              {data.workExperience.map((job, idx) => (
                <div className="tr-card" key={`${job.company}-${idx}`}>
                  <div className="tr-card-h">
                    <h3>
                      {job.title}
                      {job.company ? ` — ${job.company}` : ""}
                    </h3>
                    <span className="tr-date">
                      {job.startDate}
                      {job.endDate ? ` – ${job.endDate}` : ""}
                    </span>
                  </div>
                  <div className="tr-card-b">
                    <ul>
                      {job.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.education.map((edu, idx) => (
            <div className="tr-card" key={`${edu.institution}-${idx}`}>
              <div className="tr-card-h tr-card-h-alt">
                <h3>Education: {edu.degree}</h3>
                <span className="tr-date">
                  {edu.startDate}
                  {edu.endDate ? ` – ${edu.endDate}` : ""}
                </span>
              </div>
              <div className="tr-card-b">
                {edu.stream && (
                  <p>
                    <strong>Stream:</strong> {edu.stream}
                  </p>
                )}
                <p>
                  <strong>Institution:</strong> {edu.institution}
                </p>
              </div>
            </div>
          ))}

          {data.additionalWorks.length > 0 && (
            <div className="tr-card">
              <div className="tr-card-h tr-card-h-alt">
                <h3>Additional Works</h3>
              </div>
              <div className="tr-card-b">
                <ul>
                  {data.additionalWorks.map((w) => (
                    <li key={w.description}>{w.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </article>
  );
}
