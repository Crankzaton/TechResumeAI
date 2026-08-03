import Link from "next/link";
import { THEMES } from "@/lib/themes";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden />
        <div className="hero-content">
          <h1 className="hero-brand">
            Tech<span>Resume</span>AI
          </h1>
          <p className="hero-copy">
            Collect client details from Google Forms, then generate resumes that
            look like their platform — ServiceNow instance UI, Salesforce
            Lightning, AWS console, or Azure portal.
          </p>
          <div className="hero-cta">
            <Link href="/intake" className="primary-btn">
              Build a resume
            </Link>
            <Link href="/docs" className="ghost-btn">
              Connect Google Forms
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>From form to finished PDF</h2>
        <p>
          Built for freelancers who design tech-themed resumes. Clients fill a
          form once; you preview, print, and deliver a branded one-pager.
        </p>
        <div className="flow-grid">
          <article className="flow-card">
            <div className="step">Step 01</div>
            <h3>Capture inputs</h3>
            <p>
              Use the built-in intake form or pipe Google Forms responses into
              the webhook with a short Apps Script.
            </p>
          </article>
          <article className="flow-card">
            <div className="step">Step 02</div>
            <h3>Match the stack</h3>
            <p>
              Choose ServiceNow, Salesforce, AWS, or Azure. Layout, colors, and
              section chrome adapt to that ecosystem.
            </p>
          </article>
          <article className="flow-card">
            <div className="step">Step 03</div>
            <h3>Preview & deliver</h3>
            <p>
              Open the live preview, export a print-ready PDF, and track orders
              from the freelancer dashboard.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Technology themes</h2>
        <p>
          Start with the ServiceNow navigator look from your reference resume,
          then switch themes without rewriting content.
        </p>
        <div className="theme-showcase">
          {THEMES.map((theme) => (
            <article
              key={theme.id}
              className="theme-tile"
              style={
                {
                  "--tile-bg": `linear-gradient(145deg, ${theme.background}, color-mix(in srgb, ${theme.accent} 35%, ${theme.background}))`,
                } as React.CSSProperties
              }
            >
              <strong>{theme.name}</strong>
              <span>{theme.description}</span>
            </article>
          ))}
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/intake?theme=servicenow" className="primary-btn">
            Try ServiceNow theme
          </Link>
        </div>
      </section>
    </>
  );
}
