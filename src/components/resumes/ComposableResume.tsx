"use client";

import type { ReactNode } from "react";
import type { ResumeData, ResumeSectionConfig } from "@/lib/types";
import { buildDesignDna, extractImpactMetrics } from "@/lib/design-dna";
import { ensureSectionLayout } from "@/lib/resume-sections";
import { MotifCanvas } from "@/components/resumes/MotifCanvas";
import { SignatureSeal } from "@/components/resumes/SignatureSeal";
import {
  ContactLine,
  ImpactStrip,
  MonoBadge,
  themeVars,
  allCerts,
} from "@/components/resumes/shared";

export type SectionHandlers = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  editMode: boolean;
  onRename?: (id: string, title: string) => void;
  onSpacerSize?: (id: string, size: number) => void;
};

type Ctx = {
  data: ResumeData;
  metrics: { label: string; value: string }[];
  handlers?: SectionHandlers;
  sections: ResumeSectionConfig[];
};

/**
 * All skins render sections in sectionLayout order so Move / drag
 * always changes the real composition (no locked sidebar slots).
 */
export function ComposableResume({
  data,
  handlers,
}: {
  data: ResumeData;
  handlers?: SectionHandlers;
}) {
  const dna = buildDesignDna(data);
  const metrics = extractImpactMetrics(data);
  const sections = ensureSectionLayout(data).filter((s) => s.visible);
  const skin = data.designTemplate || "classic";
  const layout = data.layout || "platform-dark";
  const chipStyle = data.chipStyle || "soft";
  const style = data.styleSettings;
  const align = style?.headerAlign || "split";
  const ctx: Ctx = { data, metrics, handlers, sections };

  return (
    <article
      className={`tpl composable proprietary skin-${skin} layout-${layout} structure-${skin} chip-${chipStyle} header-${align}${style?.showSectionRules === false ? " no-section-rules" : ""}${style?.denserBullets ? " denser-bullets" : ""}`}
      style={themeVars(data)}
      data-template={skin}
      data-layout={layout}
      data-chip={chipStyle}
    >
      <div className="composable-motif" aria-hidden>
        <MotifCanvas
          dna={dna}
          accent={data.themeColors.accent}
          muted={data.themeColors.muted}
        />
      </div>

      {skin === "pulse" && (
        <div className="pulse-spine composable-spine" aria-hidden />
      )}

      <div className={`structure-flow structure-${skin}`}>
        {sections.map((section, index) => (
          <Wrap
            key={section.id}
            section={section}
            handlers={handlers}
            className={flowClass(skin, section)}
            index={index}
          >
            {section.kind === "header" ? (
              <HeaderBlock data={data} />
            ) : (
              <SectionBody
                section={section}
                data={data}
                metrics={metrics}
                handlers={handlers}
                index={index}
              />
            )}
          </Wrap>
        ))}
      </div>

      <SignatureSeal
        resumeNumber={data.resumeNumber}
        designVersion={data.designVersion}
        dna={dna}
      />
    </article>
  );
}

function flowClass(skin: string, section: ResumeSectionConfig) {
  if (section.kind === "spacer") return "flow-spacer";
  if (skin === "mosaic") {
    if (
      section.kind === "header" ||
      section.kind === "experience" ||
      section.kind === "skills" ||
      section.kind === "summary"
    ) {
      return "mosaic-span-2";
    }
  }
  if (skin === "signal" && section.kind === "header") return "signal-mast";
  if (skin === "horizon" && section.kind === "header") return "horizon-band-block";
  if (skin === "pulse") return "pulse-mod";
  return "";
}

function Wrap({
  section,
  handlers,
  children,
  className = "",
  index,
}: {
  section?: ResumeSectionConfig;
  handlers?: SectionHandlers;
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  if (!section) return null;
  const selected = handlers?.selectedId === section.id;
  const editMode = handlers?.editMode;
  const isSpacer = section.kind === "spacer";

  return (
    <div
      className={`compose-section kind-${section.kind}${selected ? " is-selected" : ""}${editMode ? " is-editable" : ""} ${className}`}
      data-section-id={section.id}
      style={
        isSpacer ? { height: section.spacerSize || 24, minHeight: section.spacerSize || 24 } : undefined
      }
      onClick={(e) => {
        if (!handlers?.editMode) return;
        e.stopPropagation();
        handlers.onSelect(section.id);
      }}
    >
      {editMode && !isSpacer && (
        <div className="compose-chrome no-print">
          <span className="compose-chrome-index">
            {String((index || 0) + 1).padStart(2, "0")}
          </span>
          {selected && <em>selected · drag in Sections to reorder</em>}
        </div>
      )}
      {editMode && isSpacer && (
        <div className="spacer-chrome no-print">
          <span className="spacer-chrome-label">Spacer · not printed</span>
          <input
            type="range"
            min={8}
            max={120}
            step={2}
            value={section.spacerSize || 24}
            aria-label="Spacer height"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              handlers?.onSpacerSize?.(section.id, Number(e.target.value))
            }
          />
          <em>{section.spacerSize || 24}px</em>
        </div>
      )}
      {children}
    </div>
  );
}

function EditableHeading({
  section,
  handlers,
}: {
  section: ResumeSectionConfig;
  handlers?: SectionHandlers;
}) {
  const selected = handlers?.selectedId === section.id;
  if (handlers?.editMode && selected && handlers.onRename) {
    return (
      <input
        className="compose-h2-input"
        value={section.title}
        aria-label="Section title"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => handlers.onRename?.(section.id, e.target.value)}
      />
    );
  }
  return <h2>{section.title}</h2>;
}

function HeaderBlock({ data }: { data: ResumeData }) {
  return (
    <header className="compose-header">
      <MonoBadge data={data} />
      <div>
        <p className="compose-kicker">{data.technologyName}</p>
        <h1>{data.fullName}</h1>
        {data.headline && <p className="compose-headline">{data.headline}</p>}
      </div>
      <ContactLine data={data} />
    </header>
  );
}

function SkillsChips({ items, alt }: { items: string[]; alt?: boolean }) {
  return (
    <div className={`compose-chips${alt ? " alt" : ""}`}>
      {items.map((s) => (
        <span key={s}>{s}</span>
      ))}
    </div>
  );
}

function ExperienceList({ data }: { data: ResumeData }) {
  return (
    <>
      {data.workExperience.map((job, i) => (
        <div className="compose-job" key={`${job.company}-${i}`}>
          <div className="compose-job-top">
            <h3>
              {job.title}
              <span> — {job.company}</span>
            </h3>
            <em>
              {job.startDate} – {job.endDate}
            </em>
          </div>
          <ul>
            {job.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function SectionBody({
  section,
  data,
  metrics,
  handlers,
  index,
}: {
  section: ResumeSectionConfig;
  data: ResumeData;
  metrics: { label: string; value: string }[];
  handlers?: SectionHandlers;
  index?: number;
}) {
  if (section.kind === "spacer") {
    return <div className="compose-spacer" aria-hidden />;
  }
  if (section.kind === "impact") {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <ImpactStrip metrics={metrics} />
      </section>
    );
  }
  if (section.kind === "summary" && data.summary) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <p className="compose-summary">{data.summary}</p>
      </section>
    );
  }
  if (section.kind === "skills" && data.expertise.length) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <SkillsChips items={data.expertise} />
      </section>
    );
  }
  if (section.kind === "tools" && (data.tools?.length || 0) > 0) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <SkillsChips items={data.tools || []} alt />
      </section>
    );
  }
  if (section.kind === "experience") {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        {data.designTemplate === "signal" || data.designTemplate === "pulse" ? (
          data.workExperience.map((job, i) => (
            <div className="signal-indexed-job" key={`${job.company}-${i}`}>
              <div className="signal-idx">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="compose-job-top">
                  <h3>
                    {job.title}
                    <span> @ {job.company}</span>
                  </h3>
                  <em>
                    {job.startDate} – {job.endDate}
                  </em>
                </div>
                <ul>
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <ExperienceList data={data} />
        )}
      </section>
    );
  }
  if (section.kind === "projects" && (data.projects?.length || 0) > 0) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        {(data.projects || []).map((p) => (
          <div className="compose-job" key={p.name}>
            <h3>
              {p.name}
              {p.link ? <span> · {p.link}</span> : null}
            </h3>
            <p>{p.description}</p>
          </div>
        ))}
      </section>
    );
  }
  if (section.kind === "education") {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        {data.education.map((edu, i) => (
          <div className="compose-edu" key={`${edu.institution}-${i}`}>
            <strong>{edu.degree}</strong>
            <p>
              {edu.stream ? `${edu.stream} · ` : ""}
              {edu.institution}
            </p>
            <span>
              {edu.startDate} – {edu.endDate}
            </span>
          </div>
        ))}
      </section>
    );
  }
  if (section.kind === "certs") {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <ul className="compose-list">
          {allCerts(data).map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>
    );
  }
  if (section.kind === "languages") {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <ul className="compose-list">
          {data.languages.map((l) => (
            <li key={l.name}>
              {l.name} — {l.proficiency}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (section.kind === "awards" && (data.awards?.length || 0) > 0) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <ul className="compose-list">
          {(data.awards || []).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
    );
  }
  if (section.kind === "interests" && (data.interests?.length || 0) > 0) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <SkillsChips items={data.interests || []} />
      </section>
    );
  }
  if (section.kind === "additional" && data.additionalWorks.length > 0) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <ul className="compose-list">
          {data.additionalWorks.map((w) => (
            <li key={w.description}>{w.description}</li>
          ))}
        </ul>
      </section>
    );
  }
  if (section.kind === "custom") {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <p className="compose-summary">
          {section.customBody || "Empty custom section."}
        </p>
      </section>
    );
  }
  // Visible but empty content kinds still show title so user can edit/fill
  if (
    ["summary", "skills", "tools", "projects", "awards", "interests"].includes(
      section.kind,
    )
  ) {
    return (
      <section className="compose-block">
        <EditableHeading section={section} handlers={handlers} />
        <p className="compose-summary muted-empty">Add content in the Sections panel.</p>
      </section>
    );
  }
  return null;
}
