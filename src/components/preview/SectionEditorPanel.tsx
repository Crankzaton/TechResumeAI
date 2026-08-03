"use client";

import type { ResumeData, ResumeSectionConfig } from "@/lib/types";
import {
  duplicateSection,
  moveSection,
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

  return (
    <aside className="section-editor no-print">
      <div className="section-editor-head">
        <h3>Sections</h3>
        <button type="button" className="ghost-btn" onClick={addCustom}>
          + Section
        </button>
      </div>
      <p className="intake-hint" style={{ marginBottom: "0.6rem" }}>
        Click a section on the resume or below. Move, rename, hide, duplicate —
        then Download PDF.
      </p>
      <ul className="section-list">
        {sections.map((s) => (
          <li key={s.id} className={s.id === selectedId ? "active" : ""}>
            <button type="button" onClick={() => onSelect(s.id)}>
              <span>{s.visible ? "●" : "○"}</span>
              {s.title}
              <em>{sectionLabel(s.kind)}</em>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="section-detail">
          <label>
            Section title
            <input
              value={selected.title}
              onChange={(e) => updateSelected({ title: e.target.value })}
            />
          </label>

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
                  onResumePatch({ workExperience: parseExperience(e.target.value) })
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
              ↑ Move
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => onChange(moveSection(sections, selected.id, 1))}
            >
              ↓ Move
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                const next = duplicateSection(sections, selected.id);
                onChange(next);
                const created = next.find(
                  (s, i) =>
                    s.id !== selected.id &&
                    next[i - 1]?.id === selected.id,
                );
                if (created) onSelect(created.id);
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() =>
                updateSelected({ visible: !selected.visible })
              }
            >
              {selected.visible ? "Hide" : "Show"}
            </button>
            {selected.kind === "custom" && (
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
            {selected.kind !== "custom" && selected.kind !== "header" && (
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
