"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { THEMES } from "@/lib/themes";
import type { ThemeId } from "@/lib/types";

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
  defaultTheme = "servicenow",
}: {
  defaultTheme?: ThemeId;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeId>(defaultTheme);
  const [jobs, setJobs] = useState<JobDraft[]>([emptyJob()]);

  const themeMeta = useMemo(
    () => THEMES.find((t) => t.id === theme) ?? THEMES[0],
    [theme],
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

    const payload = {
      source: "form",
      theme,
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
          Pick the platform look that matches the candidate&apos;s stack. The
          resume layout and colors will adapt automatically.
        </p>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`theme-card ${theme === t.id ? "active" : ""}`}
              style={
                {
                  "--theme-accent": t.accent,
                  "--theme-bg": t.background,
                } as React.CSSProperties
              }
              onClick={() => setTheme(t.id)}
            >
              <span className="theme-swatch" />
              <strong>{t.name}</strong>
              <span>{t.tagline}</span>
            </button>
          ))}
        </div>
        <p className="theme-desc">{themeMeta.description}</p>
      </section>

      <section className="intake-section">
        <h2>Identity & contact</h2>
        <div className="field-grid">
          <label>
            Full name *
            <input name="fullName" required placeholder="Gokul Nath Varadarajan" />
          </label>
          <label>
            Headline
            <input name="headline" placeholder="ServiceNow Developer | CIS-ITSM" />
          </label>
          <label>
            Email *
            <input name="email" type="email" required placeholder="name@email.com" />
          </label>
          <label>
            Phone numbers
            <input name="phones" placeholder="+91-..., 91..." />
          </label>
          <label>
            LinkedIn
            <input name="linkedin" placeholder="linkedin.com/in/username" />
          </label>
          <label>
            Location
            <input name="location" placeholder="Chennai, India" />
          </label>
        </div>
      </section>

      <section className="intake-section">
        <h2>Expertise / skills</h2>
        <p className="intake-hint">One skill per line</p>
        <textarea
          name="expertise"
          rows={6}
          placeholder={"Flow Designer\nPerformance Analytics\nClient Scripts & Business Rules"}
        />
      </section>

      <section className="intake-section">
        <h2>Certifications</h2>
        <div className="field-grid">
          <label>
            Main-line
            <textarea
              name="certifications_mainline"
              rows={4}
              placeholder={"CIS - ITSM\nCertified System Administrator"}
            />
          </label>
          <label>
            Micro-certs
            <textarea
              name="certifications_micro"
              rows={4}
              placeholder={"Flow Designer\nAutomated Test Framework"}
            />
          </label>
          <label className="span-2">
            Other certifications
            <textarea
              name="certifications_other"
              rows={3}
              placeholder={"Google UX Professional Design"}
            />
          </label>
        </div>
      </section>

      <section className="intake-section">
        <h2>Languages</h2>
        <p className="intake-hint">Format: Language: Proficiency (one per line)</p>
        <textarea
          name="languages"
          rows={4}
          placeholder={"English: Native Proficiency\nTamil: Native Proficiency"}
        />
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
                  placeholder="Senior Project Engineer"
                />
              </label>
              <label>
                Company
                <input
                  value={job.company}
                  onChange={(e) => updateJob(index, { company: e.target.value })}
                  placeholder="Wipro"
                />
              </label>
              <label>
                Start date
                <input
                  value={job.startDate}
                  onChange={(e) => updateJob(index, { startDate: e.target.value })}
                  placeholder="18 Mar 2024"
                />
              </label>
              <label>
                End date
                <input
                  value={job.endDate}
                  onChange={(e) => updateJob(index, { endDate: e.target.value })}
                  placeholder="Current"
                />
              </label>
            </div>
            <label>
              Bullets (one per line)
              <textarea
                rows={5}
                value={job.bullets}
                onChange={(e) => updateJob(index, { bullets: e.target.value })}
                placeholder="- Built complex Catalog items and Flow Designer workflows"
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
        <p className="intake-hint">
          Format per block: Degree | College | 2015 - 2019 then optional stream on
          next line
        </p>
        <textarea
          name="education"
          rows={4}
          placeholder={
            "Bachelors' Degree | Panimalar Engineering College, Chennai | 2015 - 2019\nElectronics and Communication Engineering"
          }
        />
      </section>

      <section className="intake-section">
        <h2>Additional works</h2>
        <textarea
          name="additionalWorks"
          rows={4}
          placeholder={"Experienced in Figma and Adobe XD prototype creation"}
        />
      </section>

      <section className="intake-section">
        <h2>Internal notes</h2>
        <textarea
          name="notes"
          rows={3}
          placeholder="Freelancer notes (not printed on resume)"
        />
      </section>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={pending}>
          {pending ? "Building resume…" : "Generate themed resume"}
        </button>
      </div>
    </form>
  );
}
