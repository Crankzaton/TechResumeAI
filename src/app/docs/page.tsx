export default function DocsPage() {
  return (
    <div className="page" id="google-forms">
      <header className="page-header">
        <h1>Setup — Form → email → redesign</h1>
        <p>
          Goal: share only a Google Form link. When a client submits (with
          Technology), you get an email with Resume ID and a one-click preview.
        </p>
      </header>

      <article className="docs-card">
        <h2>What I need from you</h2>
        <ol>
          <li>
            <strong>Gmail App Password</strong> for gokulnathgoku23@gmail.com
            (Agent → SMTP password)
          </li>
          <li>
            <strong>Public https URL</strong> after you deploy this app
          </li>
          <li>
            Run <code>integrations/create-google-form.gs</code> once in{" "}
            <a href="https://script.google.com">script.google.com</a> — I cannot
            create the Form inside your Google account from here
          </li>
          <li>
            Optional: OneDrive Azure app Client ID / Secret / Refresh token
          </li>
        </ol>
        <p>
          Also listed in Admin → <strong>What I need</strong>.
        </p>
      </article>

      <article className="docs-card">
        <h2>Create the Form (one click script)</h2>
        <ol>
          <li>script.google.com → New project → paste create-google-form.gs</li>
          <li>
            Script Properties: <code>WEBHOOK_URL</code>, <code>NOTIFY_EMAIL</code>
          </li>
          <li>
            Run <code>createTechResumeForm</code> → approve Google permissions
          </li>
          <li>Copy the published URL — that is what you share with customers</li>
        </ol>
        <p>
          The Form includes a required <strong>Technology</strong> field used to
          choose the resume theme.
        </p>
      </article>

      <article className="docs-card">
        <h2>Resume IDs & redesign</h2>
        <p>
          Every resume gets an ID like <code>TR-1042</code> (shown in email). If
          the customer wants another design, tell the agent that ID (or use Admin
          → Orders → Redesign). A new design version is generated and emailed —
          same ID.
        </p>
      </article>

      <article className="docs-card">
        <h2>Work experience format (on the form)</h2>
        <pre>{`Senior Engineer | Acme | Jan 2022 - Current
- Clear outcome-focused bullet
- Another measurable achievement

Previous Role | Company | 2019 - 2021
- Bullet`}</pre>
      </article>
    </div>
  );
}
