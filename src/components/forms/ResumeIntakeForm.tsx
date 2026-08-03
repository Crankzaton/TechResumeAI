"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Technology } from "@/lib/types";

type AttachmentRow = {
  id: string;
  technology: string;
  file: File | null;
};

function newRow(tech = "ServiceNow"): AttachmentRow {
  return { id: Math.random().toString(36).slice(2), technology: tech, file: null };
}

export function ResumeIntakeForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [techs, setTechs] = useState<Technology[]>([]);
  const [technology, setTechnology] = useState("ServiceNow");
  const [attachments, setAttachments] = useState<AttachmentRow[]>([newRow()]);
  const [batchMsg, setBatchMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/technologies")
      .then((r) => r.json())
      .then((list: Technology[]) => {
        const active = (list || []).filter((t) => t.active);
        setTechs(active);
        if (active[0]) {
          setTechnology(active[0].name);
          setAttachments([newRow(active[0].name)]);
        }
      })
      .catch(() => setError("Could not load technologies"));
  }, []);

  function onGenerateForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const payload = {
      source: "form",
      technologyName: technology,
      theme: technology,
      Technology: technology,
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || ""),
      phones: String(form.get("mobile") || ""),
      expertise: String(form.get("skills") || ""),
      workExperience: String(form.get("experience") || ""),
      education: String(form.get("education") || ""),
      linkedin: String(form.get("linkedin") || ""),
      headline: String(form.get("headline") || ""),
      sendEmail: form.get("sendEmail") === "on",
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to generate");
          return;
        }
        router.push(`/preview/${data.id}`);
      } catch {
        setError("Network error");
      }
    });
  }

  function onGenerateAttachments(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBatchMsg(null);

    const ready = attachments.filter((a) => a.file);
    if (!ready.length) {
      setError("Add at least one file (PDF, DOCX, or TXT)");
      return;
    }

    const body = new FormData();
    ready.forEach((row, i) => {
      body.append(`file_${i}`, row.file as File);
      body.append(`technology_${i}`, row.technology);
    });
    body.append("sendEmail", "true");

    startTransition(async () => {
      try {
        const res = await fetch("/api/resumes/from-attachment", {
          method: "POST",
          body,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Attachment generate failed");
          return;
        }
        const list = data.resumes || [];
        setBatchMsg(
          `Created ${list.length} resume(s): ${list
            .map((r: { resumeNumber: string; technology: string }) =>
              `${r.resumeNumber} (${r.technology})`,
            )
            .join(", ")}`,
        );
        if (list[0]?.previewUrl) router.push(list[0].previewUrl);
      } catch {
        setError("Network error while uploading");
      }
    });
  }

  return (
    <div className="intake-stack">
      <form className="intake-form" onSubmit={onGenerateForm}>
        <section className="intake-section">
          <h2>Create resume</h2>
          <p className="intake-hint">
            Enter the basics. Technology chooses the theme — any stack, not just
            ServiceNow.
          </p>
          <div className="field-grid">
            <label>
              Name *
              <input name="fullName" required placeholder="Full name" />
            </label>
            <label>
              Technology *
              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                required
              >
                {techs.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mobile *
              <input name="mobile" required placeholder="+91-..." />
            </label>
            <label>
              Email *
              <input name="email" type="email" required placeholder="name@email.com" />
            </label>
            <label>
              Headline
              <input name="headline" placeholder="Role | specialty" />
            </label>
            <label>
              LinkedIn
              <input name="linkedin" placeholder="linkedin.com/in/..." />
            </label>
          </div>

          <label style={{ marginTop: "0.85rem" }}>
            Skills *
            <textarea
              name="skills"
              required
              rows={4}
              placeholder={"One skill per line\nFlow Designer\nITSM"}
            />
          </label>

          <label style={{ marginTop: "0.85rem" }}>
            Experience *
            <textarea
              name="experience"
              required
              rows={7}
              placeholder={
                "Title | Company | Jan 2022 - Current\n- Achievement bullet\n- Achievement bullet\n\nPrevious Title | Company | 2019 - 2021\n- Bullet"
              }
            />
          </label>

          <label style={{ marginTop: "0.85rem" }}>
            Education
            <textarea
              name="education"
              rows={3}
              placeholder={"Degree | College | 2015 - 2019"}
            />
          </label>

          <label className="check" style={{ marginTop: "0.85rem" }}>
            <input type="checkbox" name="sendEmail" defaultChecked />
            Email me the one-click link when ready
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions" style={{ marginTop: "1rem" }}>
            <button type="submit" className="primary-btn" disabled={pending}>
              {pending ? "Generating…" : "Generate resume"}
            </button>
          </div>
        </section>
      </form>

      <form className="intake-form" onSubmit={onGenerateAttachments}>
        <section className="intake-section">
          <h2>Create from attachment</h2>
          <p className="intake-hint">
            Upload one or more resumes (PDF / DOCX / TXT). Each file can use a
            different technology theme. Same fields as the Google Form.
          </p>

          {attachments.map((row, index) => (
            <div className="job-block" key={row.id}>
              <div className="field-grid">
                <label>
                  Technology
                  <select
                    value={row.technology}
                    onChange={(e) =>
                      setAttachments((rows) =>
                        rows.map((r) =>
                          r.id === row.id
                            ? { ...r, technology: e.target.value }
                            : r,
                        ),
                      )
                    }
                  >
                    {techs.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  File
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAttachments((rows) =>
                        rows.map((r) =>
                          r.id === row.id ? { ...r, file } : r,
                        ),
                      );
                    }}
                  />
                </label>
              </div>
              {row.file && (
                <p className="muted">Selected: {row.file.name}</p>
              )}
              {attachments.length > 1 && (
                <button
                  type="button"
                  className="ghost-btn danger"
                  onClick={() =>
                    setAttachments((rows) => rows.filter((r) => r.id !== row.id))
                  }
                >
                  Remove entry
                </button>
              )}
              <p className="muted">Entry {index + 1}</p>
            </div>
          ))}

          <div className="form-actions" style={{ justifyContent: "space-between" }}>
            <button
              type="button"
              className="ghost-btn"
              onClick={() =>
                setAttachments((rows) => [...rows, newRow(technology)])
              }
            >
              + Add another file / technology
            </button>
            <button type="submit" className="primary-btn" disabled={pending}>
              {pending ? "Reading files…" : "Generate from attachments"}
            </button>
          </div>

          {batchMsg && <p className="form-success">{batchMsg}</p>}
        </section>
      </form>
    </div>
  );
}
