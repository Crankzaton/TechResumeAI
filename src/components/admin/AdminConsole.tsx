"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LAYOUT_OPTIONS } from "@/lib/default-technologies";
import type {
  AgentEvent,
  AgentSettings,
  FormConnection,
  Technology,
} from "@/lib/types";

type ResumeRow = {
  id: string;
  fullName: string;
  technologyName: string;
  status: string;
  source: string;
  createdAt: string;
  contact: { email?: string };
};

type AgentPayload = {
  settings: AgentSettings;
  smtpConfigured: boolean;
  events: AgentEvent[];
};

const tabs = ["Overview", "Technologies", "Google Forms", "Agent", "Orders"] as const;

export function AdminConsole() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [techs, setTechs] = useState<Technology[]>([]);
  const [forms, setForms] = useState<FormConnection[]>([]);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [agent, setAgent] = useState<AgentPayload | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [techForm, setTechForm] = useState({
    name: "",
    tagline: "",
    layout: "modern-clean",
    accent: "#38bdf8",
    background: "#0f172a",
  });

  const [formForm, setFormForm] = useState({
    name: "",
    technologyId: "",
    googleFormUrl: "",
    fieldMapNotes: "",
  });

  const [agentForm, setAgentForm] = useState({
    freelancerName: "",
    notifyEmail: "",
    fromEmail: "",
    publicBaseUrl: "",
    autoGenerate: true,
    autoEmail: true,
    host: "",
    port: 587,
    user: "",
    pass: "",
    secure: false,
  });

  async function refresh() {
    const [t, f, r, a] = await Promise.all([
      fetch("/api/technologies").then((x) => x.json()),
      fetch("/api/forms").then((x) => x.json()),
      fetch("/api/resumes").then((x) => x.json()),
      fetch("/api/agent").then((x) => x.json()),
    ]);
    setTechs(t);
    setForms(f);
    setResumes(r);
    setAgent(a);
    setAgentForm({
      freelancerName: a.settings.freelancerName || "",
      notifyEmail: a.settings.notifyEmail || "",
      fromEmail: a.settings.fromEmail || "",
      publicBaseUrl: a.settings.publicBaseUrl || "",
      autoGenerate: a.settings.autoGenerate,
      autoEmail: a.settings.autoEmail,
      host: a.settings.smtp.host || "",
      port: a.settings.smtp.port || 587,
      user: a.settings.smtp.user || "",
      pass: "",
      secure: a.settings.smtp.secure,
    });
    if (!formForm.technologyId && t[0]) {
      setFormForm((prev) => ({ ...prev, technologyId: t[0].id }));
    }
  }

  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const webhookBase = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return agent?.settings.publicBaseUrl || "";
  }, [agent]);

  function flash(ok: string) {
    setMessage(ok);
    setError(null);
    setTimeout(() => setMessage(null), 4000);
  }

  function addTechnology() {
    startTransition(async () => {
      const res = await fetch("/api/technologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: techForm.name,
          tagline: techForm.tagline || `${techForm.name} themed resume`,
          layout: techForm.layout,
          colors: {
            background: techForm.background,
            surface: techForm.background,
            accent: techForm.accent,
            accentText: "#0b1220",
            text: "#f8fafc",
            muted: "#94a3b8",
            cardHeader: techForm.accent,
            cardBody: "#e2e8f0",
            sidebar: techForm.background,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed");
      setTechForm({
        name: "",
        tagline: "",
        layout: "modern-clean",
        accent: "#38bdf8",
        background: "#0f172a",
      });
      await refresh();
      flash(`Technology “${data.name}” added`);
    });
  }

  function addForm() {
    startTransition(async () => {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formForm),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed");
      await refresh();
      flash(`Form “${data.name}” linked`);
    });
  }

  function saveAgent() {
    startTransition(async () => {
      const res = await fetch("/api/agent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerName: agentForm.freelancerName,
          notifyEmail: agentForm.notifyEmail,
          fromEmail: agentForm.fromEmail,
          publicBaseUrl: agentForm.publicBaseUrl,
          autoGenerate: agentForm.autoGenerate,
          autoEmail: agentForm.autoEmail,
          smtp: {
            host: agentForm.host,
            port: Number(agentForm.port),
            user: agentForm.user,
            pass: agentForm.pass || undefined,
            secure: agentForm.secure,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed");
      await refresh();
      flash(
        data.smtpConfigured
          ? "Agent settings saved — email ready"
          : "Agent settings saved — add SMTP to enable email",
      );
    });
  }

  function oneClickSample(techId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/resumes?sample=${encodeURIComponent(techId)}`);
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Sample failed");
      router.push(`/preview/${data.id}`);
    });
  }

  function emailAgain(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email" }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Email failed");
      await refresh();
      flash(data.email?.ok ? "Email sent" : data.email?.error || "Email attempted");
    });
  }

  return (
    <div className="admin-console">
      <div className="admin-tabs no-print">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {(message || error) && (
        <p className={error ? "form-error" : "form-success"}>
          {error || message}
        </p>
      )}

      {tab === "Overview" && (
        <section className="admin-panel">
          <h2>Agent at a glance</h2>
          <p className="intake-hint">
            Add any technology, link a Google Form, and the agent builds the
            themed resume and emails you a one-click preview link.
          </p>
          <div className="stat-grid">
            <div className="stat-card">
              <strong>{techs.length}</strong>
              <span>Technologies</span>
            </div>
            <div className="stat-card">
              <strong>{forms.length}</strong>
              <span>Form links</span>
            </div>
            <div className="stat-card">
              <strong>{resumes.length}</strong>
              <span>Resumes</span>
            </div>
            <div className="stat-card">
              <strong>{agent?.smtpConfigured ? "ON" : "OFF"}</strong>
              <span>Email alerts</span>
            </div>
          </div>

          <h3>One-click sample resumes</h3>
          <div className="chip-row">
            {techs
              .filter((t) => t.active)
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="ghost-btn"
                  disabled={pending}
                  onClick={() => oneClickSample(t.id)}
                  style={{ borderColor: t.colors.accent }}
                >
                  {t.name}
                </button>
              ))}
          </div>

          <h3 style={{ marginTop: "1.5rem" }}>Recent agent activity</h3>
          <ul className="event-list">
            {(agent?.events || []).slice(0, 8).map((e) => (
              <li key={e.id}>
                <span className="event-type">{e.type}</span>
                <span>{e.message}</span>
                <time>{new Date(e.createdAt).toLocaleString()}</time>
              </li>
            ))}
            {!agent?.events?.length && (
              <li className="muted">No events yet — submit a form or generate a sample.</li>
            )}
          </ul>
        </section>
      )}

      {tab === "Technologies" && (
        <section className="admin-panel">
          <h2>Technologies</h2>
          <p className="intake-hint">
            Not just ServiceNow — add React, SAP, Java, Kubernetes, or any stack.
            Colors + layout drive the resume design.
          </p>

          <div className="field-grid">
            <label>
              Technology name *
              <input
                value={techForm.name}
                onChange={(e) =>
                  setTechForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Snowflake, SAP, Golang"
              />
            </label>
            <label>
              Tagline
              <input
                value={techForm.tagline}
                onChange={(e) =>
                  setTechForm((p) => ({ ...p, tagline: e.target.value }))
                }
                placeholder="Short theme description"
              />
            </label>
            <label>
              Layout style
              <select
                value={techForm.layout}
                onChange={(e) =>
                  setTechForm((p) => ({ ...p, layout: e.target.value }))
                }
              >
                {LAYOUT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} — {o.hint}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Accent color
              <input
                type="color"
                value={techForm.accent}
                onChange={(e) =>
                  setTechForm((p) => ({ ...p, accent: e.target.value }))
                }
              />
            </label>
            <label>
              Background
              <input
                type="color"
                value={techForm.background}
                onChange={(e) =>
                  setTechForm((p) => ({ ...p, background: e.target.value }))
                }
              />
            </label>
          </div>
          <div className="form-actions" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="primary-btn"
              disabled={pending || !techForm.name.trim()}
              onClick={addTechnology}
            >
              Add technology
            </button>
          </div>

          <div className="tech-admin-list">
            {techs.map((t) => (
              <article key={t.id} className="tech-admin-card">
                <div
                  className="tech-swatch-lg"
                  style={{
                    background: `linear-gradient(120deg, ${t.colors.background}, ${t.colors.accent})`,
                  }}
                />
                <div>
                  <strong>{t.name}</strong>
                  <p>{t.tagline}</p>
                  <small>
                    {t.layout} · {t.slug}
                  </small>
                </div>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={pending}
                  onClick={() => oneClickSample(t.id)}
                >
                  One-click sample
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "Google Forms" && (
        <section className="admin-panel">
          <h2>Google Forms connections</h2>
          <p className="intake-hint">
            Link each form to a technology. New responses hit the webhook; the
            agent builds the resume and emails you.
          </p>

          <div className="field-grid">
            <label>
              Connection name *
              <input
                value={formForm.name}
                onChange={(e) =>
                  setFormForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="ServiceNow client intake"
              />
            </label>
            <label>
              Technology *
              <select
                value={formForm.technologyId}
                onChange={(e) =>
                  setFormForm((p) => ({ ...p, technologyId: e.target.value }))
                }
              >
                {techs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              Google Form URL (optional)
              <input
                value={formForm.googleFormUrl}
                onChange={(e) =>
                  setFormForm((p) => ({ ...p, googleFormUrl: e.target.value }))
                }
                placeholder="https://docs.google.com/forms/d/e/..."
              />
            </label>
            <label className="span-2">
              Field notes
              <textarea
                rows={3}
                value={formForm.fieldMapNotes}
                onChange={(e) =>
                  setFormForm((p) => ({ ...p, fieldMapNotes: e.target.value }))
                }
                placeholder="Any special question titles or client instructions"
              />
            </label>
          </div>
          <div className="form-actions" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="primary-btn"
              disabled={pending || !formForm.name.trim()}
              onClick={addForm}
            >
              Save form connection
            </button>
          </div>

          <div className="form-conn-list">
            {forms.map((f) => {
              const tech = techs.find((t) => t.id === f.technologyId);
              const url = `${webhookBase}/api/webhook/google-forms?formId=${f.id}`;
              return (
                <article key={f.id} className="docs-card">
                  <h3 style={{ marginTop: 0 }}>
                    {f.name}{" "}
                    <span className="status-pill">{tech?.name || "Tech"}</span>
                  </h3>
                  {f.googleFormUrl && (
                    <p>
                      Form:{" "}
                      <a href={f.googleFormUrl} target="_blank" rel="noreferrer">
                        Open Google Form
                      </a>
                    </p>
                  )}
                  <p className="intake-hint">Webhook URL for Apps Script:</p>
                  <pre>{url}</pre>
                  <p className="intake-hint">
                    Secret header <code>x-webhook-secret</code>:
                  </p>
                  <pre>{f.webhookSecret}</pre>
                  {f.fieldMapNotes && <p>{f.fieldMapNotes}</p>}
                </article>
              );
            })}
            {!forms.length && (
              <p className="muted">No forms linked yet.</p>
            )}
          </div>
        </section>
      )}

      {tab === "Agent" && (
        <section className="admin-panel">
          <h2>Resume Agent settings</h2>
          <p className="intake-hint">
            When a Google Form is submitted, the agent prepares the resume and
            emails you so you can share it with the customer in one click.
          </p>

          <div className="field-grid">
            <label>
              Your name
              <input
                value={agentForm.freelancerName}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, freelancerName: e.target.value }))
                }
              />
            </label>
            <label>
              Notify email *
              <input
                type="email"
                value={agentForm.notifyEmail}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, notifyEmail: e.target.value }))
                }
                placeholder="you@email.com"
              />
            </label>
            <label>
              From email
              <input
                value={agentForm.fromEmail}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, fromEmail: e.target.value }))
                }
              />
            </label>
            <label>
              Public base URL
              <input
                value={agentForm.publicBaseUrl}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, publicBaseUrl: e.target.value }))
                }
                placeholder="https://your-deployed-app.com"
              />
            </label>
            <label>
              SMTP host
              <input
                value={agentForm.host}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, host: e.target.value }))
                }
                placeholder="smtp.gmail.com"
              />
            </label>
            <label>
              SMTP port
              <input
                type="number"
                value={agentForm.port}
                onChange={(e) =>
                  setAgentForm((p) => ({
                    ...p,
                    port: Number(e.target.value),
                  }))
                }
              />
            </label>
            <label>
              SMTP user
              <input
                value={agentForm.user}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, user: e.target.value }))
                }
              />
            </label>
            <label>
              SMTP password / app password
              <input
                type="password"
                value={agentForm.pass}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, pass: e.target.value }))
                }
                placeholder="Leave blank to keep existing"
              />
            </label>
          </div>

          <div className="check-row">
            <label className="check">
              <input
                type="checkbox"
                checked={agentForm.autoGenerate}
                onChange={(e) =>
                  setAgentForm((p) => ({
                    ...p,
                    autoGenerate: e.target.checked,
                  }))
                }
              />
              Auto-generate resume on form submit
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={agentForm.autoEmail}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, autoEmail: e.target.checked }))
                }
              />
              Email me when ready
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={agentForm.secure}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, secure: e.target.checked }))
                }
              />
              SMTP secure (SSL)
            </label>
          </div>

          <div className="form-actions" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="primary-btn"
              disabled={pending}
              onClick={saveAgent}
            >
              Save agent settings
            </button>
          </div>

          <div className="docs-card" style={{ marginTop: "1.25rem" }}>
            <h3 style={{ marginTop: 0 }}>Status</h3>
            <p>
              Email alerts:{" "}
              <strong>
                {agent?.smtpConfigured ? "Configured" : "Not configured yet"}
              </strong>
            </p>
            <p className="intake-hint">
              Tip: For Gmail use an App Password. You can also set{" "}
              <code>SMTP_*</code>, <code>NOTIFY_EMAIL</code>, and{" "}
              <code>PUBLIC_BASE_URL</code> in <code>.env</code>.
            </p>
          </div>
        </section>
      )}

      {tab === "Orders" && (
        <section className="admin-panel">
          <h2>Resume orders</h2>
          <div style={{ marginBottom: "1rem" }}>
            <Link href="/intake" className="primary-btn">
              Manual intake
            </Link>
          </div>
          {resumes.length === 0 ? (
            <div className="empty-state">No orders yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Technology</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.fullName}</strong>
                      <div className="muted">{r.contact?.email}</div>
                    </td>
                    <td>{r.technologyName}</td>
                    <td>{r.source}</td>
                    <td>
                      <span className={`status-pill ${r.status}`}>{r.status}</span>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="row-actions">
                      <Link href={`/preview/${r.id}`}>Open</Link>
                      <button
                        type="button"
                        className="ghost-btn"
                        disabled={pending}
                        onClick={() => emailAgain(r.id)}
                      >
                        Email me
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
