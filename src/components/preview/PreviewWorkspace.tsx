"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import { ensureSectionLayout, ensureStyleSettings } from "@/lib/resume-sections";
import type {
  ChipStyle,
  DesignTemplateId,
  HeaderAlign,
  LayoutStyle,
  ResumeData,
  ResumeFontId,
  ResumeSectionConfig,
  ResumeStyleSettings,
  Technology,
} from "@/lib/types";
import { DEFAULT_RESUME_STYLE } from "@/lib/types";

const OTHER = "__other__";
const CHIP_STYLES: { id: ChipStyle; label: string }[] = [
  { id: "soft", label: "Soft (theme-safe)" },
  { id: "accent", label: "Accent fill" },
  { id: "outline", label: "Outline" },
  { id: "contrast", label: "High contrast" },
];
const FONT_OPTIONS: { id: ResumeFontId; label: string }[] = [
  { id: "sans", label: "Sans (Source Sans)" },
  { id: "display", label: "Display (Fraunces)" },
  { id: "serif", label: "Serif (Georgia)" },
  { id: "mono", label: "Mono" },
];
const PANEL_KEY = "techresume-preview-panels-v1";

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
  const [chipStyle, setChipStyle] = useState<ChipStyle>(
    initial.chipStyle || "soft",
  );
  const [chipColors, setChipColors] = useState(
    initial.chipColors || { background: "", text: "" },
  );
  const [styleSettings, setStyleSettings] = useState<ResumeStyleSettings>(
    ensureStyleSettings(initial),
  );
  const [panels, setPanels] = useState({
    sections: true,
    preview: true,
    controls: true,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PANEL_KEY);
      if (raw) setPanels({ ...panels, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(PANEL_KEY, JSON.stringify(panels));
  }, [panels]);

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
      chipStyle,
      chipColors:
        chipColors.background || chipColors.text
          ? {
              background: chipColors.background || colors.surface,
              text: chipColors.text || colors.text,
            }
          : undefined,
      styleSettings,
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
    chipStyle,
    chipColors,
    styleSettings,
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
      chipStyle: liveResume.chipStyle,
      chipColors: liveResume.chipColors,
      styleSettings: liveResume.styleSettings,
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
        setChipStyle(next.chipStyle || "soft");
        setChipColors(next.chipColors || { background: "", text: "" });
        if (next.styleSettings) {
          setStyleSettings(ensureStyleSettings(next));
        }
        setVariantIndex((v) => v + 1);
        setPanels({ sections: true, preview: true, controls: true });
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

  function renameSection(id: string, title: string) {
    setResume((r) => ({
      ...r,
      sectionLayout: ensureSectionLayout(r).map((s) =>
        s.id === id ? { ...s, title } : s,
      ),
    }));
  }

  function setSpacerSize(id: string, size: number) {
    setResume((r) => ({
      ...r,
      sectionLayout: ensureSectionLayout(r).map((s) =>
        s.id === id
          ? { ...s, spacerSize: Math.max(8, Math.min(120, size)) }
          : s,
      ),
    }));
  }

  function patchStyle(patch: Partial<ResumeStyleSettings>) {
    setStyleSettings((s) => ({ ...s, ...patch }));
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

  function togglePanel(key: keyof typeof panels) {
    setPanels((p) => {
      const next = { ...p, [key]: !p[key] };
      // Keep at least the preview visible
      if (!next.preview && !next.sections && !next.controls) {
        return { ...next, preview: true };
      }
      return next;
    });
  }

  function maximizePreview() {
    setPanels({ sections: false, preview: true, controls: false });
  }

  function resetPanels() {
    setPanels({ sections: true, preview: true, controls: true });
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

  const shellClass = [
    "preview-shell",
    panels.sections ? "" : "hide-sections",
    panels.controls ? "" : "hide-controls",
    panels.preview ? "" : "hide-preview",
  ]
    .filter(Boolean)
    .join(" ");

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

      <div className="preview-action-bar no-print">
        <div className="action-group" aria-label="Export">
          <span className="action-group-label">Export</span>
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
        </div>

        <div className="action-group" aria-label="Compose">
          <span className="action-group-label">Compose</span>
          <button
            type="button"
            className={editMode ? "primary-btn" : "ghost-btn"}
            onClick={() => {
              setEditMode((v) => !v);
              if (!editMode) setPanels((p) => ({ ...p, sections: true }));
            }}
          >
            {editMode ? "Editing on" : "Edit sections"}
          </button>
          <button
            type="button"
            className="primary-btn"
            disabled={pending}
            onClick={enhanceWithAi}
            title="AI takes your details and builds a full polished template"
          >
            {pending ? "Enhancing…" : "Enhance with AI"}
          </button>
          <button
            type="button"
            className="ghost-btn"
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
            Save design
          </button>
        </div>

        <div className="action-group" aria-label="Workspace">
          <span className="action-group-label">Panels</span>
          <button
            type="button"
            className={`ghost-btn${panels.sections ? " is-on" : ""}`}
            onClick={() => togglePanel("sections")}
          >
            {panels.sections ? "Sections" : "Sections +"}
          </button>
          <button
            type="button"
            className={`ghost-btn${panels.controls ? " is-on" : ""}`}
            onClick={() => togglePanel("controls")}
          >
            {panels.controls ? "Design" : "Design +"}
          </button>
          <button type="button" className="ghost-btn" onClick={maximizePreview}>
            Max preview
          </button>
          <button type="button" className="ghost-btn" onClick={resetPanels}>
            Reset panels
          </button>
        </div>

        <div className="action-group action-group-end" aria-label="Status">
          <button
            type="button"
            className="ghost-btn"
            disabled={pending}
            onClick={markDelivered}
          >
            Mark delivered
          </button>
        </div>
      </div>

      <div className={shellClass}>
        {panels.sections && editMode ? (
          <aside className="preview-sections-col no-print">
            <div className="panel-chrome">
              <strong>Sections</strong>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => togglePanel("sections")}
              >
                Minimize
              </button>
            </div>
            <SectionEditorPanel
              sections={liveResume.sectionLayout || []}
              selectedId={selectedSection}
              onSelect={setSelectedSection}
              onChange={setSections}
              resume={liveResume}
              onResumePatch={patchResume}
            />
          </aside>
        ) : (
          <button
            type="button"
            className="panel-rail no-print"
            onClick={() => {
              setEditMode(true);
              setPanels((p) => ({ ...p, sections: true }));
            }}
          >
            Sections
          </button>
        )}

        {panels.preview && (
          <div className="preview-main-col">
            <div className="preview-stage">
              <div className="resume-sheet" id="resume-print-root">
                <ResumeRenderer
                  data={liveResume}
                  handlers={
                    editMode
                      ? {
                          editMode: true,
                          selectedId: selectedSection,
                          onSelect: (id) => {
                            setSelectedSection(id);
                            setPanels((p) => ({ ...p, sections: true }));
                          },
                          onRename: renameSection,
                          onSpacerSize: setSpacerSize,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        )}

        {panels.controls ? (
          <aside className="preview-side-controls no-print">
            <div className="panel-chrome">
              <strong>Design</strong>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => togglePanel("controls")}
              >
                Minimize
              </button>
            </div>
            <div className="redesign-box">
              <p className="intake-hint redesign-hint">
                Template and accent change structure and color. Tag style fixes
                chip backgrounds on dark themes. Redesign / Save live in the top bar.
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
                    onChange={(e) => {
                      setLayout(e.target.value as LayoutStyle);
                      setChipColors({ background: "", text: "" });
                    }}
                  >
                    {LAYOUT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Tag / chip style
                  <select
                    value={chipStyle}
                    onChange={(e) => {
                      setChipStyle(e.target.value as ChipStyle);
                      setChipColors({ background: "", text: "" });
                    }}
                  >
                    {CHIP_STYLES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="style-panel">
                <p className="style-panel-title">Typography & spacing</p>
                <div className="field-grid redesign-fields">
                  <label>
                    Body font
                    <select
                      value={styleSettings.bodyFont}
                      onChange={(e) =>
                        patchStyle({ bodyFont: e.target.value as ResumeFontId })
                      }
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Heading font
                    <select
                      value={styleSettings.headingFont}
                      onChange={(e) =>
                        patchStyle({
                          headingFont: e.target.value as ResumeFontId,
                        })
                      }
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Header layout
                    <select
                      value={styleSettings.headerAlign}
                      onChange={(e) =>
                        patchStyle({
                          headerAlign: e.target.value as HeaderAlign,
                        })
                      }
                    >
                      <option value="split">Name left / contact right</option>
                      <option value="left">Stacked left</option>
                      <option value="center">Centered</option>
                    </select>
                  </label>
                </div>
                <label className="range-field">
                  Name size ({styleSettings.nameSize}px)
                  <input
                    type="range"
                    min={22}
                    max={48}
                    value={styleSettings.nameSize}
                    onChange={(e) =>
                      patchStyle({ nameSize: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="range-field">
                  Section title size ({styleSettings.sectionTitleSize}px)
                  <input
                    type="range"
                    min={9}
                    max={18}
                    value={styleSettings.sectionTitleSize}
                    onChange={(e) =>
                      patchStyle({ sectionTitleSize: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="range-field">
                  Body size ({styleSettings.bodySize}px)
                  <input
                    type="range"
                    min={11}
                    max={16}
                    value={styleSettings.bodySize}
                    onChange={(e) =>
                      patchStyle({ bodySize: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="range-field">
                  Gap between sections ({styleSettings.sectionGap}px)
                  <input
                    type="range"
                    min={0}
                    max={28}
                    value={styleSettings.sectionGap}
                    onChange={(e) =>
                      patchStyle({ sectionGap: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="range-field">
                  Section padding ({styleSettings.sectionPadding}px)
                  <input
                    type="range"
                    min={4}
                    max={20}
                    value={styleSettings.sectionPadding}
                    onChange={(e) =>
                      patchStyle({ sectionPadding: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={styleSettings.showSectionRules}
                    onChange={(e) =>
                      patchStyle({ showSectionRules: e.target.checked })
                    }
                  />
                  Show section rules / dividers
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={styleSettings.denserBullets}
                    onChange={(e) =>
                      patchStyle({ denserBullets: e.target.checked })
                    }
                  />
                  Denser bullet spacing
                </label>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setStyleSettings({ ...DEFAULT_RESUME_STYLE })}
                >
                  Reset typography
                </button>
              </div>

              <div className="chip-color-row">
                <label>
                  Tag background
                  <input
                    type="color"
                    value={
                      chipColors.background ||
                      liveResume.themeColors.surface ||
                      "#232f3e"
                    }
                    onChange={(e) =>
                      setChipColors((c) => ({
                        ...c,
                        background: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Tag text
                  <input
                    type="color"
                    value={
                      chipColors.text || liveResume.themeColors.text || "#fafafa"
                    }
                    onChange={(e) =>
                      setChipColors((c) => ({ ...c, text: e.target.value }))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setChipColors({ background: "", text: "" })}
                >
                  Reset tags
                </button>
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
              <p className="intake-hint redesign-hint">
                Use <strong>Redesign</strong> / <strong>Save design</strong> in
                the top bar. This panel tunes palette, type, and tags.
              </p>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            className="panel-rail no-print"
            onClick={() => setPanels((p) => ({ ...p, controls: true }))}
          >
            Design
          </button>
        )}
      </div>
    </div>
  );
}
