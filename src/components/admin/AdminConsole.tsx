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
  resumeNumber?: string;
  fullName: string;
  technologyName: string;
  layout?: string;
  designVersion?: number;
  status: string;
  source: string;
  createdAt: string;
  contact: { email?: string };
};

type AgentPayload = {
  settings: AgentSettings;
  smtpConfigured: boolean;
  oneDriveConfigured?: boolean;
  events: AgentEvent[];
};

const tabs = [
  "Overview",
  "Technologies",
  "Google Forms",
  "Agent",
  "Orders",
  "What I need",
] as const;

export function AdminConsole({
  initial,
}: {
  initial?: {
    technologies: Technology[];
    forms: FormConnection[];
    resumes: ResumeRow[];
    agent: AgentPayload;
  };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [techs, setTechs] = useState<Technology[]>(initial?.technologies || []);
  const [forms, setForms] = useState<FormConnection[]>(initial?.forms || []);
  const [resumes, setResumes] = useState<ResumeRow[]>(initial?.resumes || []);
  const [agent, setAgent] = useState<AgentPayload | null>(initial?.agent || null);
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

  const [agentForm, setAgentForm] = useState({
    freelancerName: initial?.agent?.settings.freelancerName || "",
    notifyEmail: initial?.agent?.settings.notifyEmail || "",
    fromEmail: initial?.agent?.settings.fromEmail || "",
    publicBaseUrl: initial?.agent?.settings.publicBaseUrl || "",
    autoGenerate: initial?.agent?.settings.autoGenerate ?? true,
    autoEmail: initial?.agent?.settings.autoEmail ?? true,
    host: initial?.agent?.settings.smtp.host || "",
    port: initial?.agent?.settings.smtp.port || 587,
    user: initial?.agent?.settings.smtp.user || "",
    pass: "",
    secure: initial?.agent?.settings.smtp.secure || false,
    odEnabled: initial?.agent?.settings.oneDrive?.enabled || false,
    odClientId: initial?.agent?.settings.oneDrive?.clientId || "",
    odClientSecret: "",
    odTenantId: initial?.agent?.settings.oneDrive?.tenantId || "common",
    odRefreshToken: "",
    odFolder: initial?.agent?.settings.oneDrive?.folderPath || "TechResumeAI",
  });

  const [redesignId, setRedesignId] = useState("");
  const [redesignTech, setRedesignTech] = useState("");
  const [formForm, setFormForm] = useState({
    name: "",
    technologyId: initial?.technologies?.[0]?.id || "",
    googleFormUrl: "",
    fieldMapNotes: "",
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
      odEnabled: a.settings.oneDrive?.enabled || false,
      odClientId: a.settings.oneDrive?.clientId || "",
      odClientSecret: "",
      odTenantId: a.settings.oneDrive?.tenantId || "common",
      odRefreshToken: "",
      odFolder: a.settings.oneDrive?.folderPath || "TechResumeAI",
    });
    if (!formForm.technologyId && t[0]) {
      setFormForm((prev) => ({ ...prev, technologyId: t[0].id }));
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
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
          oneDrive: {
            enabled: agentForm.odEnabled,
            clientId: agentForm.odClientId,
            clientSecret: agentForm.odClientSecret || undefined,
            tenantId: agentForm.odTenantId,
            refreshToken: agentForm.odRefreshToken || undefined,
            folderPath: agentForm.odFolder,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed");
      await refresh();
      flash(
        [
          data.smtpConfigured ? "Email ready" : "Email needs App Password",
          data.oneDriveConfigured ? "OneDrive ready" : "OneDrive optional",
        ].join(" · "),
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
      flash(data.email?.emailSent || data.email?.ok ? "Email sent" : data.email?.emailError || data.email?.error || "Email attempted");
    });
  }

  function redesignById() {
    if (!redesignId.trim()) return setError("Enter a Resume ID like TR-1001");
    startTransition(async () => {
      const res = await fetch(
        `/api/resumes/${encodeURIComponent(redesignId.trim())}/redesign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            technology: redesignTech || undefined,
            sendEmail: true,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Redesign failed");
      flash(
        `Redesigned ${data.resumeNumber} v${data.designVersion} (${data.layout})`,
      );
      router.push(data.previewUrl);
    });
  }

  return (
    <div className="admin-console">
      <div className="admin-tabs no-print" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTab(t);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginTop: "-0.35rem" }}>
        Active tab: <strong>{tab}</strong>
        {techs.length ? ` · ${techs.length} technologies loaded` : " · loading…"}
      </p>

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
            <label className="check">
              <input
                type="checkbox"
                checked={agentForm.odEnabled}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, odEnabled: e.target.checked }))
                }
              />
              Save resumes to OneDrive
            </label>
          </div>

          <h3>OneDrive (optional — your 1TB)</h3>
          <div className="field-grid">
            <label>
              Client ID
              <input
                value={agentForm.odClientId}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, odClientId: e.target.value }))
                }
              />
            </label>
            <label>
              Tenant ID
              <input
                value={agentForm.odTenantId}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, odTenantId: e.target.value }))
                }
                placeholder="common"
              />
            </label>
            <label>
              Client secret
              <input
                type="password"
                value={agentForm.odClientSecret}
                onChange={(e) =>
                  setAgentForm((p) => ({
                    ...p,
                    odClientSecret: e.target.value,
                  }))
                }
                placeholder="Leave blank to keep existing"
              />
            </label>
            <label>
              Refresh token
              <input
                type="password"
                value={agentForm.odRefreshToken}
                onChange={(e) =>
                  setAgentForm((p) => ({
                    ...p,
                    odRefreshToken: e.target.value,
                  }))
                }
                placeholder="Leave blank to keep existing"
              />
            </label>
            <label className="span-2">
              Folder path
              <input
                value={agentForm.odFolder}
                onChange={(e) =>
                  setAgentForm((p) => ({ ...p, odFolder: e.target.value }))
                }
              />
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
                {agent?.smtpConfigured ? "Configured" : "Needs Gmail App Password"}
              </strong>
            </p>
            <p>
              OneDrive:{" "}
              <strong>
                {agent?.oneDriveConfigured ? "Configured" : "Optional / not set"}
              </strong>
            </p>
            <p className="intake-hint">
              Gmail App Password: myaccount.google.com/apppasswords — see{" "}
              <strong>What I need</strong> tab.
            </p>
          </div>
        </section>
      )}

      {tab === "Orders" && (
        <section className="admin-panel">
          <h2>Resume orders</h2>
          <div className="docs-card" style={{ marginBottom: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>Redesign by Resume ID</h3>
            <p className="intake-hint">
              Customer disliked the look? Enter TR-1001, optionally a new
              technology, then redesign + email.
            </p>
            <div className="field-grid">
              <label>
                Resume ID
                <input
                  value={redesignId}
                  onChange={(e) => setRedesignId(e.target.value)}
                  placeholder="TR-1001"
                />
              </label>
              <label>
                New technology (optional)
                <input
                  value={redesignTech}
                  onChange={(e) => setRedesignTech(e.target.value)}
                  placeholder="AWS / React / ServiceNow..."
                />
              </label>
            </div>
            <div className="form-actions" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="primary-btn"
                disabled={pending}
                onClick={redesignById}
              >
                Redesign & email me
              </button>
              <Link href="/intake" className="ghost-btn">
                Manual intake
              </Link>
            </div>
          </div>
          {resumes.length === 0 ? (
            <div className="empty-state">No orders yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Candidate</th>
                  <th>Technology</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.resumeNumber || r.id}</strong>
                      <div className="muted">v{r.designVersion || 1}</div>
                    </td>
                    <td>
                      <strong>{r.fullName}</strong>
                      <div className="muted">{r.contact?.email}</div>
                    </td>
                    <td>
                      {r.technologyName}
                      <div className="muted">{r.layout}</div>
                    </td>
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
                        onClick={() => emailAgain(r.resumeNumber || r.id)}
                      >
                        Email me
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        disabled={pending}
                        onClick={() => {
                          setRedesignId(r.resumeNumber || r.id);
                          setRedesignTech(r.technologyName);
                        }}
                      >
                        Use ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {tab === "What I need" && (
        <section className="admin-panel">
          <h2>What I need from you to go fully live</h2>
          <p className="intake-hint">
            I cannot log into Gmail or OneDrive from this environment. Provide
            the items below and the share-form → email flow works end-to-end.
          </p>
          <article className="docs-card">
            <h3 style={{ marginTop: 0 }}>1) Gmail App Password (required)</h3>
            <ol>
              <li>Enable 2-Step Verification on gokulnathgoku23@gmail.com</li>
              <li>
                Create App Password at{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                >
                  myaccount.google.com/apppasswords
                </a>
              </li>
              <li>Paste into Agent → SMTP password (user = your Gmail)</li>
            </ol>
          </article>
          <article className="docs-card">
            <h3 style={{ marginTop: 0 }}>2) Create Google Form (one-time script)</h3>
            <ol>
              <li>
                Open{" "}
                <a href="https://script.google.com" target="_blank" rel="noreferrer">
                  script.google.com
                </a>{" "}
                signed into the same Gmail
              </li>
              <li>
                New project → paste <code>integrations/create-google-form.gs</code>
              </li>
              <li>
                Script Properties: <code>WEBHOOK_URL</code> (deployed app
                /api/webhook/google-forms), <code>NOTIFY_EMAIL</code>
              </li>
              <li>
                Run <code>createTechResumeForm</code> → approve → get public form
                link (includes required Technology field)
              </li>
            </ol>
          </article>
          <article className="docs-card">
            <h3 style={{ marginTop: 0 }}>3) Public https URL (required)</h3>
            <p>
              Deploy the app (Vercel etc.) and set PUBLIC_BASE_URL — Google cannot
              call localhost.
            </p>
          </article>
          <article className="docs-card">
            <h3 style={{ marginTop: 0 }}>4) OneDrive (optional)</h3>
            <p>
              Azure app registration + refresh token. Until then, local{" "}
              <code>data/</code> storage still works for IDs, email, and redesign.
            </p>
          </article>
          <article className="docs-card">
            <h3 style={{ marginTop: 0 }}>Redesign workflow</h3>
            <p>
              Emails include Resume ID like <code>TR-1042</code>. Tell me that ID
              (or use Orders → Redesign) to generate a new design version and email
              you again.
            </p>
          </article>
        </section>
      )}
    </div>
  );
}
