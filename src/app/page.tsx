import Link from "next/link";
import { listTechnologies } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const technologies = await listTechnologies();
  const active = technologies.filter((t) => t.active).slice(0, 8);

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden />
        <div className="hero-content">
          <h1 className="hero-brand">
            Tech<span>Resume</span>AI
          </h1>
          <p className="hero-copy">
            Your resume agent for freelancing. Clients fill Google Forms — the
            agent builds a clear, technology-themed resume and emails you a
            one-click link to share.
          </p>
          <div className="hero-cta">
            <Link href="/admin" className="primary-btn">
              Open Admin / Agent
            </Link>
            <Link href="/intake" className="ghost-btn">
              Build a resume now
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Agent workflow</h2>
        <p>
          Configure once in the admin console. Every new form response is
          handled automatically — any technology, one-click delivery.
        </p>
        <div className="flow-grid">
          <article className="flow-card">
            <div className="step">Step 01</div>
            <h3>Register technologies</h3>
            <p>
              ServiceNow, Salesforce, AWS, React, Java, SAP, Kubernetes — or add
              your own colors and layout in Admin.
            </p>
          </article>
          <article className="flow-card">
            <div className="step">Step 02</div>
            <h3>Link Google Forms</h3>
            <p>
              Each form points at a technology. Apps Script posts to the agent
              webhook the moment a client submits.
            </p>
          </article>
          <article className="flow-card">
            <div className="step">Step 03</div>
            <h3>Get emailed, share fast</h3>
            <p>
              The agent builds the resume and emails you. Open the link, print
              PDF, send to your customer.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Technology themes ready</h2>
        <p>
          Clear typography and high-contrast layouts so customers can actually
          read the resume. Add more anytime from Admin.
        </p>
        <div className="theme-showcase">
          {active.map((theme) => (
            <article
              key={theme.id}
              className="theme-tile"
              style={
                {
                  "--tile-bg": `linear-gradient(145deg, ${theme.colors.background}, color-mix(in srgb, ${theme.colors.accent} 40%, ${theme.colors.background}))`,
                } as React.CSSProperties
              }
            >
              <strong>{theme.name}</strong>
              <span>{theme.description}</span>
            </article>
          ))}
        </div>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/admin" className="primary-btn">
            Manage technologies
          </Link>
          <Link href="/docs" className="ghost-btn">
            Google Forms setup
          </Link>
        </div>
      </section>
    </>
  );
}
