"use client";

import { useState } from "react";
import type { ResumeData, ResumeSectionConfig } from "@/lib/types";
import {
  duplicateSection,
  insertSpacerAfter,
  moveSection,
  moveSectionTo,
  sectionLabel,
} from "@/lib/resume-sections";

export function SectionEditorPanel({
  sections,
  selectedId,
  onSelect,
  onChange,
  resume,
  onResumePatch,
}: {
  sections: ResumeSectionConfig[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (next: ResumeSectionConfig[]) => void;
  resume: ResumeData;
  onResumePatch: (patch: Partial<ResumeData>) => void;
}) {
  const selected = sections.find((s) => s.id === selectedId) || null;
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function updateSelected(patch: Partial<ResumeSectionConfig>) {
    if (!selected) return;
    onChange(
      sections.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)),
    );
  }

  function addCustom() {
    const id = `custom-${Date.now().toString(36)}`;
    const next: ResumeSectionConfig = {
      id,
      kind: "custom",
      title: "New section",
      visible: true,
      customBody: "Describe this section…",
    };
    onChange([...sections, next]);
    onSelect(id);
  }

  function addSpacer() {
    const next = insertSpacerAfter(sections, selectedId, 28);
    onChange(next);
    const created = next.find(
      (s) => s.kind === "spacer" && !sections.some((o) => o.id === s.id),
    );
    if (created) onSelect(created.id);
  }

  function onDropOn(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const toIndex = sections.findIndex((s) => s.id === targetId);
    if (toIndex < 0) return;
    onChange(moveSectionTo(sections, dragId, toIndex));
    onSelect(dragId);
    setDragId(null);
    setOverId(null);
  }

  return (
    <aside className="section-editor no-print">
      <div className="section-editor-head">
        <h3>Sections</h3>
        <div className="section-editor-add">
          <button type="button" className="ghost-btn" onClick={addSpacer}>
            + Spacer
          </button>
          <button type="button" className="ghost-btn" onClick={addCustom}>
            + Section
          </button>
        </div>
      </div>
      <p className="intake-hint section-editor-hint">
        Drag any row to place it anywhere. Spacers are edit-only and never print.
      </p>
      <ul className="section-list">
        {sections.map((s, index) => {
          const label = sectionLabel(s.kind);
          const showKindHint =
            s.kind !== "spacer" &&
            s.title.trim().toLowerCase() !== label.toLowerCase();
          return (
            <li
              key={s.id}
              className={[
                s.id === selectedId ? "active" : "",
                dragId === s.id ? "is-dragging" : "",
                overId === s.id ? "is-drop-target" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable
              onDragStart={(e) => {
                setDragId(s.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", s.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overId !== s.id) setOverId(s.id);
              }}
              onDragLeave={() => {
                if (overId === s.id) setOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDropOn(s.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
            >
              <button type="button" onClick={() => onSelect(s.id)}>
                <span className="section-drag" aria-hidden>
                  ⋮⋮
                </span>
                <span className="section-vis" aria-hidden>
                  {s.visible ? "●" : "○"}
                </span>
                <span className="section-list-title">
                  {s.kind === "spacer"
                    ? `Spacer · ${s.spacerSize || 24}px`
                    : s.title}
                </span>
                <span className="section-list-meta">
                  #{index + 1}
                  {showKindHint ? ` · ${label}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div className="section-detail">
          {selected.kind !== "spacer" && (
            <label>
              Section title
              <input
                value={selected.title}
                onChange={(e) => updateSelected({ title: e.target.value })}
              />
            </label>
          )}

          {selected.kind === "spacer" && (
            <label className="range-field">
              Spacer height ({selected.spacerSize || 24}px) — not printed
              <input
                type="range"
                min={8}
                max={120}
                step={2}
                value={selected.spacerSize || 24}
                onChange={(e) =>
                  updateSelected({
                    spacerSize: Math.max(8, Number(e.target.value) || 24),
                  })
                }
              />
            </label>
          )}

          {selected.kind === "custom" && (
            <label>
              Content
              <textarea
                rows={4}
                value={selected.customBody || ""}
                onChange={(e) => updateSelected({ customBody: e.target.value })}
              />
            </label>
          )}

          {selected.kind === "summary" && (
            <label>
              Summary text
              <textarea
                rows={4}
                value={resume.summary || ""}
                onChange={(e) => onResumePatch({ summary: e.target.value })}
              />
            </label>
          )}

          {selected.kind === "skills" && (
            <label>
              Skills (one per line)
              <textarea
                rows={5}
                value={resume.expertise.join("\n")}
                onChange={(e) =>
                  onResumePatch({
                    expertise: e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
          )}

          {selected.kind === "tools" && (
            <label>
              Tools (one per line)
              <textarea
                rows={4}
                value={(resume.tools || []).join("\n")}
                onChange={(e) =>
                  onResumePatch({
                    tools: e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
          )}

          {selected.kind === "header" && (
            <>
              <label>
                Full name
                <input
                  value={resume.fullName}
                  onChange={(e) => onResumePatch({ fullName: e.target.value })}
                />
              </label>
              <label>
                Headline
                <input
                  value={resume.headline || ""}
                  onChange={(e) => onResumePatch({ headline: e.target.value })}
                />
              </label>
            </>
          )}

          {selected.kind === "experience" && (
            <label>
              Experience (Title | Company | dates, then - bullets)
              <textarea
                rows={8}
                value={serializeExperience(resume)}
                onChange={(e) =>
                  onResumePatch({
                    workExperience: parseExperience(e.target.value),
                  })
                }
              />
            </label>
          )}

          {selected.kind === "projects" && (
            <label>
              Projects (Name | link, then description lines)
              <textarea
                rows={6}
                value={serializeProjects(resume)}
                onChange={(e) =>
                  onResumePatch({ projects: parseProjects(e.target.value) })
                }
              />
            </label>
          )}

          <div className="section-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => onChange(moveSection(sections, selected.id, -1))}
            >
              ↑ Up
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => onChange(moveSection(sections, selected.id, 1))}
            >
              ↓ Down
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                const next = insertSpacerAfter(sections, selected.id, 28);
                onChange(next);
              }}
            >
              + Spacer below
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                const next = duplicateSection(sections, selected.id);
                onChange(next);
                const created = next.find(
                  (s, i) =>
                    s.id !== selected.id && next[i - 1]?.id === selected.id,
                );
                if (created) onSelect(created.id);
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => updateSelected({ visible: !selected.visible })}
            >
              {selected.visible ? "Hide" : "Show"}
            </button>
            {(selected.kind === "custom" || selected.kind === "spacer") && (
              <button
                type="button"
                className="ghost-btn danger"
                onClick={() => {
                  onChange(sections.filter((s) => s.id !== selected.id));
                  onSelect(null);
                }}
              >
                Delete
              </button>
            )}
            {selected.kind !== "custom" &&
              selected.kind !== "header" &&
              selected.kind !== "spacer" && (
                <button
                  type="button"
                  className="ghost-btn danger"
                  onClick={() => updateSelected({ visible: false })}
                >
                  Remove from resume
                </button>
              )}
          </div>
        </div>
      )}
    </aside>
  );
}

function serializeExperience(resume: ResumeData) {
  return resume.workExperience
    .map(
      (j) =>
        `${j.title} | ${j.company} | ${j.startDate} - ${j.endDate}\n${j.bullets
          .map((b) => `- ${b}`)
          .join("\n")}`,
    )
    .join("\n\n");
}

function parseExperience(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const parts = (lines[0] || "").split("|").map((p) => p.trim());
      const dates = (parts[2] || "").split(/\s+-\s+|–|—/).map((s) => s.trim());
      return {
        title: parts[0] || "Role",
        company: parts[1] || "",
        startDate: dates[0] || "",
        endDate: dates[1] || "Current",
        bullets: lines
          .slice(1)
          .map((l) => l.replace(/^[-•*]\s*/, ""))
          .filter(Boolean),
      };
    });
}

function serializeProjects(resume: ResumeData) {
  return (resume.projects || [])
    .map((p) => `${p.name}${p.link ? ` | ${p.link}` : ""}\n${p.description}`)
    .join("\n\n");
}

function parseProjects(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const parts = (lines[0] || "").split("|").map((p) => p.trim());
      return {
        name: parts[0] || "Project",
        link: parts[1],
        description: lines.slice(1).join(" ") || "",
      };
    });
}
