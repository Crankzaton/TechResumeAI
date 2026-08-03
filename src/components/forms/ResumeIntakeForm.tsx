"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Technology } from "@/lib/types";

const DRAFT_KEY = "techresume-intake-draft-v1";

type AttachmentRow = {
  id: string;
  technology: string;
  file: File | null;
};

type Draft = {
  fullName: string;
  technology: string;
  mobile: string;
  email: string;
  headline: string;
  linkedin: string;
  location: string;
  website: string;
  summary: string;
  skills: string;
  tools: string;
  experience: string;
  projects: string;
  education: string;
  certifications: string;
  languages: string;
  awards: string;
  interests: string;
  additional: string;
  sendEmail: boolean;
};

const emptyDraft = (): Draft => ({
  fullName: "",
  technology: "ServiceNow",
  mobile: "",
  email: "",
  headline: "",
  linkedin: "",
  location: "",
  website: "",
  summary: "",
  skills: "",
  tools: "",
  experience: "",
  projects: "",
  education: "",
  certifications: "",
  languages: "",
  awards: "",
  interests: "",
  additional: "",
  sendEmail: true,
});

function newRow(tech = "ServiceNow"): AttachmentRow {
  return { id: Math.random().toString(36).slice(2), technology: tech, file: null };
}

export function ResumeIntakeForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [techs, setTechs] = useState<Technology[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [draftReady, setDraftReady] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([newRow()]);
  const [batchMsg, setBatchMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Draft;
        setDraft({ ...emptyDraft(), ...parsed });
      }
    } catch {
      /* ignore */
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, draftReady]);

  useEffect(() => {
    fetch("/api/technologies")
      .then((r) => r.json())
      .then((list: Technology[]) => {
        const active = (list || []).filter((t) => t.active);
        setTechs(active);
        if (active[0] && !localStorage.getItem(DRAFT_KEY)) {
          setDraft((d) => ({ ...d, technology: active[0].name }));
          setAttachments([newRow(active[0].name)]);
        }
      })
      .catch(() => setError("Could not load technologies"));
  }, []);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function onGenerateForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const payload = {
      source: "form",
      technologyName: draft.technology,
      theme: draft.technology,
      Technology: draft.technology,
      fullName: draft.fullName,
      email: draft.email,
      phones: draft.mobile,
      location: draft.location,
      website: draft.website,
      linkedin: draft.linkedin,
      headline: draft.headline,
      summary: draft.summary,
      expertise: draft.skills,
      tools: draft.tools,
      workExperience: draft.experience,
      projects: draft.projects,
      education: draft.education,
      certifications: draft.certifications,
      languages: draft.languages,
      awards: draft.awards,
      interests: draft.interests,
      additionalWorks: draft.additional,
      sendEmail: draft.sendEmail,
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
        // Keep draft so going back restores fields
        router.push(`/preview/${data.id}`);
      } catch {
        setError("Network error");
      }
    });
  }

  function clearDraft() {
    setDraft(emptyDraft());
    localStorage.removeItem(DRAFT_KEY);
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
          <div className="intake-section-head">
            <h2>Create resume</h2>
            <button type="button" className="ghost-btn" onClick={clearDraft}>
              Clear saved draft
            </button>
          </div>
          <p className="intake-hint">
            Fields auto-save in this browser. Going back after Generate restores
            everything. Each block below becomes a resume section you can edit
            later in preview.
          </p>

          <h3 className="intake-sub">Contact</h3>
          <div className="field-grid">
            <label>
              Name *
              <input
                required
                value={draft.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Full name"
              />
            </label>
            <label>
              Technology *
              <select
                value={draft.technology}
                onChange={(e) => setField("technology", e.target.value)}
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
              <input
                required
                value={draft.mobile}
                onChange={(e) => setField("mobile", e.target.value)}
                placeholder="+91-..."
              />
            </label>
            <label>
              Email *
              <input
                type="email"
                required
                value={draft.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="name@email.com"
              />
            </label>
            <label>
              Headline
              <input
                value={draft.headline}
                onChange={(e) => setField("headline", e.target.value)}
                placeholder="Role | specialty"
              />
            </label>
            <label>
              LinkedIn
              <input
                value={draft.linkedin}
                onChange={(e) => setField("linkedin", e.target.value)}
                placeholder="linkedin.com/in/..."
              />
            </label>
            <label>
              Location
              <input
                value={draft.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="City, Country"
              />
            </label>
            <label>
              Website / portfolio
              <input
                value={draft.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <h3 className="intake-sub">Professional summary</h3>
          <label>
            Summary
            <textarea
              rows={3}
              value={draft.summary}
              onChange={(e) => setField("summary", e.target.value)}
              placeholder="2–4 lines for recruiters — impact, stack, domain."
            />
          </label>

          <h3 className="intake-sub">Skills & tools</h3>
          <label>
            Skills *
            <textarea
              required
              rows={4}
              value={draft.skills}
              onChange={(e) => setField("skills", e.target.value)}
              placeholder={"One skill per line\nFlow Designer\nITSM"}
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Tools & platforms
            <textarea
              rows={3}
              value={draft.tools}
              onChange={(e) => setField("tools", e.target.value)}
              placeholder={"One per line\nJira\nGit\nJenkins"}
            />
          </label>

          <h3 className="intake-sub">Experience</h3>
          <label>
            Work experience *
            <textarea
              required
              rows={7}
              value={draft.experience}
              onChange={(e) => setField("experience", e.target.value)}
              placeholder={
                "Title | Company | Jan 2022 - Current\n- Achievement bullet\n- Achievement bullet\n\nPrevious Title | Company | 2019 - 2021\n- Bullet"
              }
            />
          </label>

          <h3 className="intake-sub">Projects</h3>
          <label>
            Projects
            <textarea
              rows={5}
              value={draft.projects}
              onChange={(e) => setField("projects", e.target.value)}
              placeholder={
                "Project name | optional-link\nShort description of what you built\n\nAnother project\nDescription"
              }
            />
          </label>

          <h3 className="intake-sub">Education & credentials</h3>
          <label>
            Education
            <textarea
              rows={3}
              value={draft.education}
              onChange={(e) => setField("education", e.target.value)}
              placeholder={"Degree | College | 2015 - 2019"}
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Certifications
            <textarea
              rows={3}
              value={draft.certifications}
              onChange={(e) => setField("certifications", e.target.value)}
              placeholder={"One per line\nCIS-ITSM\nAWS SAA"}
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Languages
            <textarea
              rows={2}
              value={draft.languages}
              onChange={(e) => setField("languages", e.target.value)}
              placeholder={"English: Native\nTamil: Native"}
            />
          </label>

          <h3 className="intake-sub">Extra sections</h3>
          <label>
            Awards
            <textarea
              rows={2}
              value={draft.awards}
              onChange={(e) => setField("awards", e.target.value)}
              placeholder="One award per line"
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Interests
            <textarea
              rows={2}
              value={draft.interests}
              onChange={(e) => setField("interests", e.target.value)}
              placeholder="One interest per line"
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Additional
            <textarea
              rows={2}
              value={draft.additional}
              onChange={(e) => setField("additional", e.target.value)}
              placeholder="Open source, speaking, volunteering…"
            />
          </label>

          <label className="check" style={{ marginTop: "0.85rem" }}>
            <input
              type="checkbox"
              checked={draft.sendEmail}
              onChange={(e) => setField("sendEmail", e.target.checked)}
            />
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
            different technology theme.
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
              {row.file && <p className="muted">Selected: {row.file.name}</p>}
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
                setAttachments((rows) => [...rows, newRow(draft.technology)])
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
