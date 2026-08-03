"use client";

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
};

/** Single composable renderer — respects section order + all design skins. */
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

  return (
    <article
      className={`tpl composable proprietary skin-${skin} layout-${layout}`}
      style={themeVars(data)}
      data-template={skin}
      data-layout={layout}
    >
      <div className="composable-motif" aria-hidden>
        <MotifCanvas
          dna={dna}
          accent={data.themeColors.accent}
          muted={data.themeColors.muted}
        />
      </div>

      {skin === "pulse" && <div className="pulse-spine composable-spine" aria-hidden />}

      <div className="composable-body">
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            data={data}
            metrics={metrics}
            handlers={handlers}
          />
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

function SectionBlock({
  section,
  data,
  metrics,
  handlers,
}: {
  section: ResumeSectionConfig;
  data: ResumeData;
  metrics: { label: string; value: string }[];
  handlers?: SectionHandlers;
}) {
  const selected = handlers?.selectedId === section.id;
  const editMode = handlers?.editMode;

  return (
    <div
      className={`compose-section kind-${section.kind}${selected ? " is-selected" : ""}${editMode ? " is-editable" : ""}`}
      data-section-id={section.id}
      onClick={(e) => {
        if (!handlers?.editMode) return;
        e.stopPropagation();
        handlers.onSelect(section.id);
      }}
    >
      {editMode && (
        <div className="compose-chrome no-print">
          <span>{section.title}</span>
          {selected && <em>selected · use panel to move / rename / duplicate</em>}
        </div>
      )}

      {section.kind === "header" && (
        <header className="compose-header">
          <MonoBadge data={data} />
          <div>
            <p className="compose-kicker">{data.technologyName}</p>
            <h1>{data.fullName}</h1>
            {data.headline && <p className="compose-headline">{data.headline}</p>}
          </div>
          <ContactLine data={data} />
        </header>
      )}

      {section.kind === "summary" && data.summary && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <p className="compose-summary">{data.summary}</p>
        </section>
      )}

      {section.kind === "impact" && <ImpactStrip metrics={metrics} />}

      {section.kind === "skills" && data.expertise.length > 0 && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <div className="compose-chips">
            {data.expertise.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      )}

      {section.kind === "tools" && (data.tools?.length || 0) > 0 && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <div className="compose-chips alt">
            {(data.tools || []).map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      )}

      {section.kind === "experience" && (
        <section className="compose-block">
          <h2>{section.title}</h2>
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
        </section>
      )}

      {section.kind === "projects" && (data.projects?.length || 0) > 0 && (
        <section className="compose-block">
          <h2>{section.title}</h2>
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
      )}

      {section.kind === "education" && (
        <section className="compose-block">
          <h2>{section.title}</h2>
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
      )}

      {section.kind === "certs" && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <ul className="compose-list">
            {allCerts(data).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {section.kind === "languages" && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <ul className="compose-list">
            {data.languages.map((l) => (
              <li key={l.name}>
                {l.name} — {l.proficiency}
              </li>
            ))}
          </ul>
        </section>
      )}

      {section.kind === "awards" && (data.awards?.length || 0) > 0 && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <ul className="compose-list">
            {(data.awards || []).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      {section.kind === "interests" && (data.interests?.length || 0) > 0 && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <div className="compose-chips">
            {(data.interests || []).map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        </section>
      )}

      {section.kind === "additional" && data.additionalWorks.length > 0 && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <ul className="compose-list">
            {data.additionalWorks.map((w) => (
              <li key={w.description}>{w.description}</li>
            ))}
          </ul>
        </section>
      )}

      {section.kind === "custom" && (
        <section className="compose-block">
          <h2>{section.title}</h2>
          <p className="compose-summary">
            {section.customBody || "Empty custom section — edit in the panel."}
          </p>
        </section>
      )}
    </div>
  );
}
