import type { ResumeData } from "@/lib/types";

function certsBy(
  data: ResumeData,
  category: "mainline" | "micro" | "other",
) {
  return data.certifications.filter((c) => (c.category ?? "mainline") === category);
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sn-nav-section">
      <div className="sn-nav-header">
        <span className="sn-chevron" aria-hidden>
          ▾
        </span>
        <span>{title}</span>
      </div>
      <div className="sn-nav-body">{children}</div>
    </section>
  );
}

export function ServiceNowResume({ data }: { data: ResumeData }) {
  const mainline = certsBy(data, "mainline");
  const micro = certsBy(data, "micro");
  const other = certsBy(data, "other");

  return (
    <article className="sn-resume" data-theme="servicenow">
      <div className="sn-accent-bar" aria-hidden />

      <header className="sn-header">
        <h1 className="sn-name">{data.fullName}</h1>
        <div className="sn-contact">
          {data.contact.phones.filter(Boolean).map((phone) => (
            <span key={phone}>{phone}</span>
          ))}
          {data.contact.linkedin && (
            <a href={`https://${data.contact.linkedin.replace(/^https?:\/\//, "")}`}>
              {data.contact.linkedin.replace(/^https?:\/\//, "")}
            </a>
          )}
          {data.contact.email && <span>{data.contact.email}</span>}
        </div>
      </header>

      <div className="sn-divider" />

      <div className="sn-body">
        <aside className="sn-sidebar">
          <div className="sn-filter">
            <span className="sn-filter-icon" aria-hidden>
              ▾
            </span>
            <span>Filter</span>
            <span className="sn-pin" aria-hidden>
              📌
            </span>
          </div>

          {data.expertise.length > 0 && (
            <SidebarSection title="Expertise">
              <ul>
                {data.expertise.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {mainline.length > 0 && (
            <SidebarSection title="Certifications (Main-Line)">
              <ul>
                {mainline.map((c) => (
                  <li key={c.name}>{c.name}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {micro.length > 0 && (
            <SidebarSection title="Certifications (Micro-Cert)">
              <ul>
                {micro.map((c) => (
                  <li key={c.name}>{c.name}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {other.length > 0 && (
            <SidebarSection title="Other Certifications">
              <ul>
                {other.map((c) => (
                  <li key={c.name}>{c.name}</li>
                ))}
              </ul>
            </SidebarSection>
          )}

          {data.languages.length > 0 && (
            <SidebarSection title="Languages">
              <ul>
                {data.languages.map((l) => (
                  <li key={l.name}>
                    <strong>{l.name}</strong>
                    <span className="sn-muted"> ({l.proficiency})</span>
                  </li>
                ))}
              </ul>
            </SidebarSection>
          )}
        </aside>

        <main className="sn-main">
          {data.workExperience.length > 0 && (
            <div className="sn-section">
              <div className="sn-pill">
                <span className="sn-star" aria-hidden>
                  ★
                </span>
                Work Experience
              </div>

              {data.workExperience.map((job, idx) => (
                <div className="sn-card" key={`${job.company}-${idx}`}>
                  <div className="sn-card-header">
                    <h2>
                      {job.title}
                      {job.company ? ` - ${job.company}` : ""}
                    </h2>
                    <span className="sn-date">
                      {job.startDate}
                      {job.endDate ? ` - ${job.endDate}` : ""}
                    </span>
                  </div>
                  <div className="sn-card-body">
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
            <div className="sn-card" key={`${edu.institution}-${idx}`}>
              <div className="sn-card-header sn-card-header-edu">
                <h2>
                  Education: {edu.degree}
                </h2>
                <span className="sn-date">
                  {edu.startDate}
                  {edu.endDate ? ` - ${edu.endDate}` : ""}
                </span>
              </div>
              <div className="sn-card-body">
                {edu.stream && (
                  <p>
                    <strong>Stream:</strong> {edu.stream}
                  </p>
                )}
                <p>
                  <strong>College:</strong> {edu.institution}
                </p>
              </div>
            </div>
          ))}

          {data.additionalWorks.length > 0 && (
            <div className="sn-card">
              <div className="sn-card-header sn-card-header-edu">
                <h2>Additional Works</h2>
              </div>
              <div className="sn-card-body">
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
