"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ResumeRenderer } from "@/components/resumes/ResumeRenderer";
import { SectionEditorPanel } from "@/components/preview/SectionEditorPanel";
import { LAYOUT_OPTIONS } from "@/lib/default-technologies";
import {
  colorVariant,
  DESIGN_TEMPLATES,
  layoutAccentPalette,
  nextLayout,
} from "@/lib/design-variants";
import { pickContrastingTemplate } from "@/lib/ai-enhance";
import { ensureSectionLayout } from "@/lib/resume-sections";
import type {
  DesignTemplateId,
  LayoutStyle,
  ResumeData,
  ResumeSectionConfig,
  Technology,
} from "@/lib/types";

const OTHER = "__other__";

function templateMeta(id?: DesignTemplateId) {
  return (
    DESIGN_TEMPLATES.find((t) => t.id === (id || "classic")) ||
    DESIGN_TEMPLATES[0]
  );
}

export function PreviewWorkspace({
  resume: initial,
  technologies,
}: {
  resume: ResumeData;
  technologies: Technology[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const initialTech =
    technologies.find(
      (t) =>
        t.id === initial.technologyId ||
        t.name === initial.technologyName ||
        t.slug === initial.technologyId,
    ) || technologies[0];

  const [techKey, setTechKey] = useState(initialTech?.id || OTHER);
  const [otherName, setOtherName] = useState(
    initialTech ? "" : initial.technologyName,
  );
  const [layout, setLayout] = useState<LayoutStyle>(initial.layout);
  const [designTemplate, setDesignTemplate] = useState<DesignTemplateId>(
    initial.designTemplate || "classic",
  );
  const [variantIndex, setVariantIndex] = useState(0);
  const [resume, setResume] = useState(() => ({
    ...initial,
    sectionLayout: ensureSectionLayout(initial),
  }));

  const selectedTech = useMemo(() => {
    if (techKey === OTHER) return null;
    return technologies.find((t) => t.id === techKey) || null;
  }, [techKey, technologies]);

  const liveResume: ResumeData = useMemo(() => {
    const baseColors =
      selectedTech?.colors ||
      resume.themeColors ||
      technologies[0]?.colors;
    // Layout accent remaps palette so dropdown always visibly changes design
    const laid = layoutAccentPalette(layout, baseColors);
    const colors = colorVariant(laid, variantIndex);
    return {
      ...resume,
      technologyId: selectedTech?.id || resume.technologyId,
      technologyName:
        techKey === OTHER
          ? otherName.trim() || "Custom"
          : selectedTech?.name || resume.technologyName,
      layout,
      designTemplate,
      themeColors: colors,
      sectionLayout: ensureSectionLayout(resume),
    };
  }, [
    resume,
    selectedTech,
    techKey,
    otherName,
    layout,
    designTemplate,
    variantIndex,
    technologies,
  ]);

  const tpl = templateMeta(designTemplate);

  async function persistLiveDesign(extra?: Partial<ResumeData>) {
    const payload = {
      technologyId: liveResume.technologyId,
      technologyName: liveResume.technologyName,
      layout: liveResume.layout,
      designTemplate: liveResume.designTemplate,
      themeColors: liveResume.themeColors,
      sectionLayout: liveResume.sectionLayout,
      fullName: liveResume.fullName,
      headline: liveResume.headline,
      summary: liveResume.summary,
      expertise: liveResume.expertise,
      tools: liveResume.tools,
      workExperience: liveResume.workExperience,
      projects: liveResume.projects,
      education: liveResume.education,
      certifications: liveResume.certifications,
      languages: liveResume.languages,
      awards: liveResume.awards,
      interests: liveResume.interests,
      additionalWorks: liveResume.additionalWorks,
      designVersion: resume.designVersion || 1,
      ...extra,
    };
    const res = await fetch(`/api/resumes/${resume.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Save failed");
    setResume({ ...data, sectionLayout: ensureSectionLayout(data) });
    return data as ResumeData;
  }

  function onTechChange(value: string) {
    setTechKey(value);
    setVariantIndex(0);
    if (value !== OTHER) {
      const tech = technologies.find((t) => t.id === value);
      if (tech) setLayout(tech.layout);
    }
  }

  function redesign() {
    // Jump to a clearly different structural template (skip adjacent twin)
    const nextTpl = pickContrastingTemplate(designTemplate);
    const used = resume.previousLayouts || [];
    const nextLay = nextLayout(layout, used);
    setDesignTemplate(nextTpl);
    setLayout(nextLay);
    setVariantIndex((v) => v + 1);
    // Nudge section order so composition feels redesigned, not recolored
    setResume((r) => {
      const sections = ensureSectionLayout(r);
      const header = sections.filter((s) => s.kind === "header");
      const rest = sections.filter((s) => s.kind !== "header");
      const rotated = [...rest.slice(1), ...rest.slice(0, 1)];
      return { ...r, sectionLayout: [...header, ...rotated] };
    });
    const meta = templateMeta(nextTpl);
    setMsg(`New layout → ${meta.name}`);
  }

  function enhanceWithAi() {
    startTransition(async () => {
      try {
        setError(null);
        await persistLiveDesign();
        const res = await fetch(`/api/resumes/${resume.id}/enhance`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "AI enhance failed");
        const next = data.resume as ResumeData;
        setResume({ ...next, sectionLayout: ensureSectionLayout(next) });
        if (next.designTemplate) setDesignTemplate(next.designTemplate);
        if (next.layout) setLayout(next.layout);
        setVariantIndex((v) => v + 1);
        setMsg(
          data.message ||
            `AI enhanced → ${templateMeta(next.designTemplate).name}`,
        );
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "AI enhance failed");
      }
    });
  }

  function patchResume(patch: Partial<ResumeData>) {
    setResume((r) => ({ ...r, ...patch }));
  }

  function setSections(next: ResumeSectionConfig[]) {
    setResume((r) => ({ ...r, sectionLayout: next }));
  }

  function downloadPdf() {
    startTransition(async () => {
      try {
        setError(null);
        await persistLiveDesign();
        const res = await fetch(`/api/resumes/${resume.id}/pdf`);
        if (!res.ok) {
          window.open(`/preview/${resume.id}/print?autoprint=1`, "_blank");
          setMsg("Opened resume-only print view — Save as PDF");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${liveResume.resumeNumber}_${liveResume.fullName.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setMsg("Downloaded resume PDF (matches current preview)");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Download failed");
      }
    });
  }

  function emailPdf() {
    startTransition(async () => {
      try {
        setError(null);
        const saved = await persistLiveDesign();
        const res = await fetch(`/api/resumes/${saved.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "email", attachPdf: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Email failed");
        const email = data.email || data;
        setMsg(
          email.emailSent || email.ok
            ? `Emailed ${saved.resumeNumber} with PDF attachment`
            : email.emailError || email.error || "Email attempted",
        );
        if (data.resume) setResume({ ...data.resume, sectionLayout: ensureSectionLayout(data.resume) });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Email failed");
      }
    });
  }

  function saveRedesign() {
    startTransition(async () => {
      try {
        setError(null);
        const saved = await persistLiveDesign({
          designVersion: (resume.designVersion || 1) + 1,
          previousLayouts: [...(resume.previousLayouts || []), resume.layout],
          previousTemplates: [
            ...(resume.previousTemplates || []),
            resume.designTemplate || "classic",
          ],
          status: "ready",
        });
        setMsg(
          `Saved ${saved.resumeNumber} v${saved.designVersion} · ${templateMeta(saved.designTemplate).name}`,
        );
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

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

  return (
    <div className="preview-workspace no-print-parent">
      <header className="preview-topbar no-print">
        <div className="preview-toolbar-meta">
          <p
            className="eyebrow"
            title={`${liveResume.resumeNumber} · ${tpl.name} · ${liveResume.layout}`}
          >
            <span>{liveResume.resumeNumber}</span>
            <span>v{liveResume.designVersion || 1}</span>
            <span className="eyebrow-clip">{liveResume.technologyName}</span>
            <span className="eyebrow-clip">{tpl.name}</span>
          </p>
          <h1>{liveResume.fullName}</h1>
          <p className="meta">
            Status: <strong>{resume.status}</strong>
          </p>
        </div>
        <div className="preview-toast-slot" aria-live="polite">
          {msg ? <p className="form-success preview-toast">{msg}</p> : null}
          {error ? <p className="form-error preview-toast">{error}</p> : null}
        </div>
      </header>

      <div className="preview-shell">
        <div className="preview-main-col">
          <div className="preview-action-bar no-print">
            <button
              type="button"
              className="ghost-btn"
              disabled={pending}
              onClick={downloadPdf}
            >
              Download PDF
            </button>
            <button
              type="button"
              className="ghost-btn"
              disabled={pending}
              onClick={emailPdf}
            >
              Email PDF
            </button>
            <button
              type="button"
              className={editMode ? "primary-btn" : "ghost-btn"}
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? "Editing on" : "Edit sections"}
            </button>
            <button
              type="button"
              className="primary-btn"
              disabled={pending}
              onClick={enhanceWithAi}
            >
              {pending ? "Enhancing…" : "Enhance using AI"}
            </button>
            <button
              type="button"
              className="ghost-btn"
              disabled={pending}
              onClick={markDelivered}
            >
              Mark delivered
            </button>
          </div>

          <div className={`preview-edit-grid${editMode ? " editing" : ""}`}>
            {editMode && (
              <SectionEditorPanel
                sections={liveResume.sectionLayout || []}
                selectedId={selectedSection}
                onSelect={setSelectedSection}
                onChange={setSections}
                resume={liveResume}
                onResumePatch={patchResume}
              />
            )}
            <div className="preview-stage">
              <div className="resume-sheet" id="resume-print-root">
                <ResumeRenderer
                  data={liveResume}
                  handlers={
                    editMode
                      ? {
                          editMode: true,
                          selectedId: selectedSection,
                          onSelect: setSelectedSection,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="preview-side-controls no-print">
          <div className="redesign-box">
            <p className="intake-hint redesign-hint">
              Redesign switches a full structural layout (not just colors). AI
              Enhance rewrites copy and picks a new composition.
            </p>
            <div className="field-grid redesign-fields">
              <label>
                Technology
                <select
                  value={techKey}
                  onChange={(e) => onTechChange(e.target.value)}
                >
                  {technologies.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                  <option value={OTHER}>Other…</option>
                </select>
              </label>
              <label>
                Design template
                <select
                  value={designTemplate}
                  onChange={(e) =>
                    setDesignTemplate(e.target.value as DesignTemplateId)
                  }
                >
                  {DESIGN_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Layout accent
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as LayoutStyle)}
                >
                  {LAYOUT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div
              className={`redesign-other-slot${techKey === OTHER ? " open" : ""}`}
            >
              {techKey === OTHER ? (
                <label>
                  Custom technology name
                  <input
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="e.g. Snowflake, Golang"
                  />
                </label>
              ) : null}
            </div>
            <div className="preview-action-row">
              <button
                type="button"
                className="primary-btn"
                disabled={pending}
                onClick={redesign}
              >
                Redesign
              </button>
              <button
                type="button"
                className="ghost-btn"
                disabled={pending}
                onClick={saveRedesign}
              >
                Save this design
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
