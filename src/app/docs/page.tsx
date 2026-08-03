export default function DocsPage() {
  return (
    <div className="page" id="google-forms">
      <header className="page-header">
        <h1>Setup guide</h1>
        <p>
          Connect Google Forms to the TechResumeAI agent so every submission
          becomes a themed resume — and you get an email with a one-click link.
        </p>
      </header>

      <article className="docs-card">
        <h2>1. Admin console (required)</h2>
        <ol>
          <li>
            Open <a href="/admin">Admin / Agent</a>
          </li>
          <li>
            <strong>Technologies</strong> — add any stack (or use the seeded
            ones: ServiceNow, Salesforce, AWS, Azure, React, Java, Python,
            Kubernetes, SAP, DevOps).
          </li>
          <li>
            <strong>Google Forms</strong> — create a connection, pick the
            technology, copy the webhook URL + secret.
          </li>
          <li>
            <strong>Agent</strong> — set your notify email + SMTP so new forms
            email you automatically.
          </li>
        </ol>
      </article>

      <article className="docs-card">
        <h2>2. Google Form questions</h2>
        <ul>
          <li>Full Name</li>
          <li>Email</li>
          <li>Phone Numbers</li>
          <li>LinkedIn</li>
          <li>
            Technology Theme (optional if the form connection already binds a
            technology)
          </li>
          <li>Headline</li>
          <li>Expertise (one per line)</li>
          <li>Certifications (Main-Line) / Micro / Other</li>
          <li>Languages</li>
          <li>Work Experience</li>
          <li>Education</li>
          <li>Additional Works</li>
          <li>Notes</li>
        </ul>
      </article>

      <article className="docs-card">
        <h2>3. Work experience format</h2>
        <pre>{`Senior Engineer | Acme | Jan 2022 - Current
- Clear outcome-focused bullet
- Another measurable achievement

Previous Role | Company | 2019 - 2021
- Bullet`}</pre>
      </article>

      <article className="docs-card">
        <h2>4. Apps Script</h2>
        <ol>
          <li>Link form → Google Sheet</li>
          <li>
            Paste <code>integrations/google-apps-script.gs</code>
          </li>
          <li>
            Script Properties:
            <ul>
              <li>
                <code>WEBHOOK_URL</code> = the URL from Admin → Google Forms
                (includes <code>formId=</code>)
              </li>
              <li>
                <code>WEBHOOK_SECRET</code> = the connection secret
              </li>
            </ul>
          </li>
          <li>
            Trigger: <code>onFormSubmit</code> → From form → On form submit
          </li>
        </ol>
      </article>

      <article className="docs-card">
        <h2>5. What happens on submit</h2>
        <ol>
          <li>Client submits Google Form</li>
          <li>Agent maps answers → technology theme</li>
          <li>Resume is generated with readable, high-contrast design</li>
          <li>You receive an email with <strong>Open resume (one click)</strong></li>
          <li>Print → Save as PDF → share with customer → Mark delivered</li>
        </ol>
      </article>
    </div>
  );
}
