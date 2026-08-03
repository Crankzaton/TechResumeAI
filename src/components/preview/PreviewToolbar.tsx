"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ResumeData } from "@/lib/types";
import { LAYOUT_OPTIONS } from "@/lib/default-technologies";

export function PreviewToolbar({ resume }: { resume: ResumeData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tech, setTech] = useState(resume.technologyName);
  const [layout, setLayout] = useState(resume.layout);
  const [msg, setMsg] = useState<string | null>(null);

  function markDelivered() {
    startTransition(async () => {
      await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      router.refresh();
    });
  }

  function emailMe() {
    startTransition(async () => {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email" }),
      });
      const data = await res.json();
      setMsg(
        data.email?.emailSent || data.email?.ok
          ? `Emailed ${resume.resumeNumber}`
          : data.email?.emailError || data.email?.error || "Email attempted",
      );
      router.refresh();
    });
  }

  function redesign() {
    startTransition(async () => {
      const res = await fetch(`/api/resumes/${resume.resumeNumber}/redesign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technology: tech,
          layout,
          sendEmail: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Redesign failed");
        return;
      }
      setMsg(
        `Redesigned ${data.resumeNumber} → v${data.designVersion} (${data.layout})`,
      );
      router.push(data.previewUrl);
      router.refresh();
    });
  }

  return (
    <div className="preview-toolbar no-print">
      <div>
        <p className="eyebrow">
          {resume.resumeNumber} · v{resume.designVersion || 1} ·{" "}
          {resume.technologyName} · {resume.layout}
        </p>
        <h1>{resume.fullName}</h1>
        <p className="meta">
          Status: <strong>{resume.status}</strong> · Source: {resume.source}
          {resume.oneDriveWebUrl ? (
            <>
              {" "}
              ·{" "}
              <a href={resume.oneDriveWebUrl} target="_blank" rel="noreferrer">
                OneDrive
              </a>
            </>
          ) : null}
        </p>
        {msg && <p className="form-success">{msg}</p>}
      </div>
      <div className="toolbar-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button type="button" className="ghost-btn" onClick={() => window.print()}>
            Download / Print PDF
          </button>
          <button type="button" className="ghost-btn" disabled={pending} onClick={emailMe}>
            Email me link
          </button>
          <button type="button" className="primary-btn" disabled={pending} onClick={markDelivered}>
            Mark delivered
          </button>
        </div>
        <div className="redesign-box">
          <p className="intake-hint" style={{ marginBottom: "0.4rem" }}>
            Customer disliked the design? Change tech/layout and redesign — keeps the same ID.
          </p>
          <div className="field-grid" style={{ marginBottom: "0.5rem" }}>
            <label>
              Technology
              <input value={tech} onChange={(e) => setTech(e.target.value)} />
            </label>
            <label>
              Layout
              <select
                value={layout}
                onChange={(e) =>
                  setLayout(e.target.value as ResumeData["layout"])
                }
              >
                {LAYOUT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            className="primary-btn"
            disabled={pending}
            onClick={redesign}
          >
            Redesign {resume.resumeNumber} & email me
          </button>
        </div>
      </div>
    </div>
  );
}
