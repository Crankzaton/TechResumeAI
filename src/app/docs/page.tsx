export default function DocsPage() {
  return (
    <div className="page" id="google-forms">
      <header className="page-header">
        <h1>Google Forms setup</h1>
        <p>
          Clients fill your form; an Apps Script posts each response to
          TechResumeAI and builds a themed resume automatically.
        </p>
      </header>

      <article className="docs-card">
        <h2>1. Create the form questions</h2>
        <p>Use these exact titles (or keep the aliases below):</p>
        <ul>
          <li>Full Name</li>
          <li>Email</li>
          <li>Phone Numbers</li>
          <li>LinkedIn</li>
          <li>Technology Theme (multiple choice: ServiceNow / Salesforce / AWS / Azure)</li>
          <li>Expertise (paragraph — one skill per line)</li>
          <li>Certifications (Main-Line)</li>
          <li>Certifications (Micro-Cert)</li>
          <li>Other Certifications</li>
          <li>Languages (Language: Proficiency per line)</li>
          <li>Work Experience</li>
          <li>Education</li>
          <li>Additional Works</li>
          <li>Notes</li>
        </ul>
      </article>

      <article className="docs-card">
        <h2>2. Work experience format</h2>
        <p>Ask clients to follow this pattern in the paragraph field:</p>
        <pre>{`Senior Project Engineer | Wipro | 18 Mar 2024 - Current
- Instance administration and access management
- Complex Catalog items and Flow Designer workflows

Infra Transformation Analyst | Accenture | 28 Oct 2021 - 15 Mar 2024
- Custom application development for finance cycles`}</pre>
      </article>

      <article className="docs-card">
        <h2>3. Connect Apps Script</h2>
        <ol>
          <li>Link the form to a Google Sheet (Responses → Link to Sheets).</li>
          <li>
            In the sheet: Extensions → Apps Script, paste{" "}
            <code>integrations/google-apps-script.gs</code>.
          </li>
          <li>
            Project Settings → Script Properties:
            <ul>
              <li>
                <code>WEBHOOK_URL</code> ={" "}
                <code>https://YOUR_DOMAIN/api/webhook/google-forms</code>
              </li>
              <li>
                <code>WEBHOOK_SECRET</code> = same value as server env{" "}
                <code>WEBHOOK_SECRET</code> (optional but recommended)
              </li>
            </ul>
          </li>
          <li>
            Triggers → Add trigger → function <code>onFormSubmit</code> → event
            source From form → On form submit.
          </li>
        </ol>
      </article>

      <article className="docs-card">
        <h2>4. Freelancer workflow</h2>
        <ol>
          <li>Client submits the Google Form.</li>
          <li>Webhook creates a resume order (visible under Orders).</li>
          <li>Open preview, tweak if needed via a new intake, print to PDF.</li>
          <li>Mark delivered when you send the file to the client.</li>
        </ol>
        <p>
          Prefer collecting inside the app? Use the{" "}
          <a href="/intake">intake form</a> — same fields, instant preview.
        </p>
      </article>

      <article className="docs-card">
        <h2>5. Example webhook payload</h2>
        <pre>{`POST /api/webhook/google-forms
Header: x-webhook-secret: your-secret

{
  "Full Name": "Ada Lovelace",
  "Email": "ada@example.com",
  "Technology Theme": "ServiceNow",
  "Expertise": "Flow Designer\\nITSM",
  "Work Experience": "Developer | Acme | 2022 - Current\\n- Built catalog items"
}`}</pre>
      </article>
    </div>
  );
}
