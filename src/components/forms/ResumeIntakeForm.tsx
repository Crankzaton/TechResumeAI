"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Technology } from "@/lib/types";

type JobDraft = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string;
};

const emptyJob = (): JobDraft => ({
  title: "",
  company: "",
  startDate: "",
  endDate: "",
  bullets: "",
});

export function ResumeIntakeForm({
  defaultTechnologyId,
}: {
  defaultTechnologyId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [techs, setTechs] = useState<Technology[]>([]);
  const [technologyId, setTechnologyId] = useState(defaultTechnologyId || "");
  const [jobs, setJobs] = useState<JobDraft[]>([emptyJob()]);

  useEffect(() => {
    fetch("/api/technologies")
      .then((r) => r.json())
      .then((list: Technology[]) => {
        setTechs(list.filter((t) => t.active));
        if (!technologyId && list[0]) {
          const preferred =
            list.find((t) => t.id === defaultTechnologyId) || list[0];
          setTechnologyId(preferred.id);
        }
      })
      .catch(() => setError("Could not load technologies"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => techs.find((t) => t.id === technologyId) || techs[0],
    [techs, technologyId],
  );

  function updateJob(index: number, patch: Partial<JobDraft>) {
    setJobs((prev) =>
      prev.map((job, i) => (i === index ? { ...job, ...patch } : job)),
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const techName = selected?.name || String(form.get("technologyName") || "");

    const payload = {
      source: "form",
      theme: techName,
      technologyName: techName,
      fullName: String(form.get("fullName") || ""),
      headline: String(form.get("headline") || ""),
      email: String(form.get("email") || ""),
      phones: String(form.get("phones") || ""),
      linkedin: String(form.get("linkedin") || ""),
      location: String(form.get("location") || ""),
      expertise: String(form.get("expertise") || ""),
      certifications_mainline: String(form.get("certifications_mainline") || ""),
      certifications_micro: String(form.get("certifications_micro") || ""),
      certifications_other: String(form.get("certifications_other") || ""),
      languages: String(form.get("languages") || ""),
      education: String(form.get("education") || ""),
      additionalWorks: String(form.get("additionalWorks") || ""),
      notes: String(form.get("notes") || ""),
      sendEmail: form.get("sendEmail") === "on",
      workExperience: jobs
        .filter((j) => j.title.trim())
        .map((j) => ({
          title: j.title.trim(),
          company: j.company.trim(),
          startDate: j.startDate.trim(),
          endDate: j.endDate.trim() || "Current",
          bullets: j.bullets
            .split("\n")
            .map((b) => b.replace(/^[-•*]\s*/, "").trim())
            .filter(Boolean),
        })),
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
          setError(data.error || "Failed to create resume");
          return;
        }
        router.push(`/preview/${data.id}`);
      } catch {
        setError("Network error — please try again");
      }
    });
  }

  return (
    <form className="intake-form" onSubmit={onSubmit}>
      <section className="intake-section">
        <h2>Technology theme</h2>
        <p className="intake-hint">
          Choose any stack configured in the admin console. Designs adapt
          automatically.
        </p>
        <div className="theme-grid">
          {techs.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`theme-card ${technologyId === t.id ? "active" : ""}`}
              style={
                {
                  "--theme-accent": t.colors.accent,
                  "--theme-bg": t.colors.background,
                } as React.CSSProperties
              }
              onClick={() => setTechnologyId(t.id)}
            >
              <span className="theme-swatch" />
              <strong>{t.name}</strong>
              <span>{t.tagline}</span>
            </button>
          ))}
        </div>
        {selected && <p className="theme-desc">{selected.description}</p>}
      </section>

      <section className="intake-section">
        <h2>Identity & contact</h2>
        <div className="field-grid">
          <label>
            Full name *
            <input name="fullName" required placeholder="Full legal name" />
          </label>
          <label>
            Headline
            <input name="headline" placeholder="Role | Specialty" />
          </label>
          <label>
            Email *
            <input name="email" type="email" required placeholder="name@email.com" />
          </label>
          <label>
            Phone numbers
            <input name="phones" placeholder="+91-..., +1-..." />
          </label>
          <label>
            LinkedIn
            <input name="linkedin" placeholder="linkedin.com/in/username" />
          </label>
          <label>
            Location
            <input name="location" placeholder="City, Country" />
          </label>
        </div>
      </section>

      <section className="intake-section">
        <h2>Expertise / skills</h2>
        <p className="intake-hint">One skill per line — keep wording clear for recruiters</p>
        <textarea
          name="expertise"
          rows={6}
          placeholder={"Skill one\nSkill two\nSkill three"}
        />
      </section>

      <section className="intake-section">
        <h2>Certifications</h2>
        <div className="field-grid">
          <label>
            Main certifications
            <textarea name="certifications_mainline" rows={4} />
          </label>
          <label>
            Micro-certs
            <textarea name="certifications_micro" rows={4} />
          </label>
          <label className="span-2">
            Other certifications
            <textarea name="certifications_other" rows={3} />
          </label>
        </div>
      </section>

      <section className="intake-section">
        <h2>Languages</h2>
        <p className="intake-hint">Format: Language: Proficiency</p>
        <textarea name="languages" rows={4} placeholder={"English: Native Proficiency"} />
      </section>

      <section className="intake-section">
        <div className="section-head">
          <h2>Work experience</h2>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setJobs((j) => [...j, emptyJob()])}
          >
            + Add role
          </button>
        </div>
        {jobs.map((job, index) => (
          <div className="job-block" key={index}>
            <div className="field-grid">
              <label>
                Title
                <input
                  value={job.title}
                  onChange={(e) => updateJob(index, { title: e.target.value })}
                />
              </label>
              <label>
                Company
                <input
                  value={job.company}
                  onChange={(e) => updateJob(index, { company: e.target.value })}
                />
              </label>
              <label>
                Start date
                <input
                  value={job.startDate}
                  onChange={(e) =>
                    updateJob(index, { startDate: e.target.value })
                  }
                />
              </label>
              <label>
                End date
                <input
                  value={job.endDate}
                  onChange={(e) => updateJob(index, { endDate: e.target.value })}
                />
              </label>
            </div>
            <label>
              Bullets (one per line — write outcomes clearly)
              <textarea
                rows={5}
                value={job.bullets}
                onChange={(e) => updateJob(index, { bullets: e.target.value })}
              />
            </label>
            {jobs.length > 1 && (
              <button
                type="button"
                className="ghost-btn danger"
                onClick={() => setJobs((j) => j.filter((_, i) => i !== index))}
              >
                Remove role
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="intake-section">
        <h2>Education</h2>
        <textarea
          name="education"
          rows={4}
          placeholder={
            "Degree | Institution | 2015 - 2019\nStream / major"
          }
        />
      </section>

      <section className="intake-section">
        <h2>Additional works</h2>
        <textarea name="additionalWorks" rows={4} />
      </section>

      <section className="intake-section">
        <h2>Delivery</h2>
        <label className="check">
          <input type="checkbox" name="sendEmail" />
          Also email me the one-click preview link (uses Agent SMTP settings)
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Internal notes (not printed)"
          style={{ marginTop: "0.75rem" }}
        />
      </section>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={pending}>
          {pending ? "Agent building resume…" : "Generate resume (one click)"}
        </button>
      </div>
    </form>
  );
}
