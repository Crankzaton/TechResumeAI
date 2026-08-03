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
};

type Ctx = {
  data: ResumeData;
  metrics: { label: string; value: string }[];
  handlers?: SectionHandlers;
  sections: ResumeSectionConfig[];
};

/** Structurally distinct layouts per designTemplate — Redesign is never “just colors”. */
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
  const ctx: Ctx = { data, metrics, handlers, sections };

  return (
    <article
      className={`tpl composable proprietary skin-${skin} layout-${layout} structure-${skin} chip-${chipStyle}`}
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

      {skin === "classic" && <ClassicStructure ctx={ctx} />}
      {skin === "signal" && <SignalStructure ctx={ctx} />}
      {skin === "mosaic" && <MosaicStructure ctx={ctx} />}
      {skin === "horizon" && <HorizonStructure ctx={ctx} />}
      {skin === "atelier" && <AtelierStructure ctx={ctx} />}
      {skin === "pulse" && <PulseStructure ctx={ctx} />}

      <SignatureSeal
        resumeNumber={data.resumeNumber}
        designVersion={data.designVersion}
        dna={dna}
      />
    </article>
  );
}

function Wrap({
  section,
  handlers,
  children,
  className = "",
}: {
  section?: ResumeSectionConfig;
  handlers?: SectionHandlers;
  children: ReactNode;
  className?: string;
}) {
  if (!section) return null;
  const selected = handlers?.selectedId === section.id;
  const editMode = handlers?.editMode;
  return (
    <div
      className={`compose-section kind-${section.kind}${selected ? " is-selected" : ""}${editMode ? " is-editable" : ""} ${className}`}
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
          {selected && <em>selected</em>}
        </div>
      )}
      {children}
    </div>
  );
}

function find(sections: ResumeSectionConfig[], kind: string) {
  return sections.find((s) => s.kind === kind);
}

function customs(sections: ResumeSectionConfig[]) {
  return sections.filter((s) => s.kind === "custom");
}

function HeaderBlock({ data, title }: { data: ResumeData; title?: string }) {
  return (
    <header className="compose-header">
      <MonoBadge data={data} />
      <div>
        <p className="compose-kicker">{data.technologyName}</p>
        <h1>{data.fullName}</h1>
        {data.headline && <p className="compose-headline">{data.headline}</p>}
        {title ? <p className="compose-headline">{title}</p> : null}
      </div>
      <ContactLine data={data} />
    </header>
  );
}

function SkillsChips({
  items,
  alt,
}: {
  items: string[];
  alt?: boolean;
}) {
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

function RestSections({
  ctx,
  skip,
}: {
  ctx: Ctx;
  skip: Set<string>;
}) {
  return (
    <>
      {ctx.sections
        .filter((s) => !skip.has(s.kind) && s.kind !== "header" && s.kind !== "impact")
        .map((section) => (
          <Wrap key={section.id} section={section} handlers={ctx.handlers}>
            <SectionBody section={section} data={ctx.data} metrics={ctx.metrics} />
          </Wrap>
        ))}
    </>
  );
}

function SectionBody({
  section,
  data,
  metrics,
}: {
  section: ResumeSectionConfig;
  data: ResumeData;
  metrics: { label: string; value: string }[];
}) {
  if (section.kind === "summary" && data.summary) {
    return (
      <section className="compose-block">
        <h2>{section.title}</h2>
        <p className="compose-summary">{data.summary}</p>
      </section>
    );
  }
  if (section.kind === "impact") return <ImpactStrip metrics={metrics} />;
  if (section.kind === "skills" && data.expertise.length) {
    return (
      <section className="compose-block">
        <h2>{section.title}</h2>
        <SkillsChips items={data.expertise} />
      </section>
    );
  }
  if (section.kind === "tools" && (data.tools?.length || 0) > 0) {
    return (
      <section className="compose-block">
        <h2>{section.title}</h2>
        <SkillsChips items={data.tools || []} alt />
      </section>
    );
  }
  if (section.kind === "experience") {
    return (
      <section className="compose-block">
        <h2>{section.title}</h2>
        <ExperienceList data={data} />
      </section>
    );
  }
  if (section.kind === "projects" && (data.projects?.length || 0) > 0) {
    return (
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
    );
  }
  if (section.kind === "education") {
    return (
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
    );
  }
  if (section.kind === "certs") {
    return (
      <section className="compose-block">
        <h2>{section.title}</h2>
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
        <h2>{section.title}</h2>
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
        <h2>{section.title}</h2>
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
        <h2>{section.title}</h2>
        <SkillsChips items={data.interests || []} />
      </section>
    );
  }
  if (section.kind === "additional" && data.additionalWorks.length > 0) {
    return (
      <section className="compose-block">
        <h2>{section.title}</h2>
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
        <h2>{section.title}</h2>
        <p className="compose-summary">
          {section.customBody || "Empty custom section."}
        </p>
      </section>
    );
  }
  return null;
}

/** Classic — sidebar + main column */
function ClassicStructure({ ctx }: { ctx: Ctx }) {
  const header = find(ctx.sections, "header");
  const skills = find(ctx.sections, "skills");
  const tools = find(ctx.sections, "tools");
  const certs = find(ctx.sections, "certs");
  const languages = find(ctx.sections, "languages");
  const skip = new Set(["header", "skills", "tools", "certs", "languages"]);
  return (
    <div className="structure-classic">
      <Wrap section={header} handlers={ctx.handlers}>
        <HeaderBlock data={ctx.data} />
      </Wrap>
      <Wrap section={find(ctx.sections, "impact")} handlers={ctx.handlers}>
        <ImpactStrip metrics={ctx.metrics} />
      </Wrap>
      <div className="structure-classic-grid">
        <aside className="structure-aside">
          <Wrap section={skills} handlers={ctx.handlers}>
            <section className="compose-block">
              <h2>{skills?.title || "Skills"}</h2>
              <ul className="compose-list">
                {ctx.data.expertise.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          </Wrap>
          <Wrap section={tools} handlers={ctx.handlers}>
            {(ctx.data.tools?.length || 0) > 0 && (
              <section className="compose-block">
                <h2>{tools?.title || "Tools"}</h2>
                <ul className="compose-list">
                  {(ctx.data.tools || []).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
          </Wrap>
          <Wrap section={certs} handlers={ctx.handlers}>
            {allCerts(ctx.data).length > 0 && (
              <section className="compose-block">
                <h2>{certs?.title || "Certs"}</h2>
                <ul className="compose-list">
                  {allCerts(ctx.data).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
            )}
          </Wrap>
          <Wrap section={languages} handlers={ctx.handlers}>
            {ctx.data.languages.length > 0 && (
              <section className="compose-block">
                <h2>{languages?.title || "Languages"}</h2>
                <ul className="compose-list">
                  {ctx.data.languages.map((l) => (
                    <li key={l.name}>
                      {l.name} — {l.proficiency}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </Wrap>
        </aside>
        <main className="structure-main">
          <RestSections ctx={ctx} skip={skip} />
        </main>
      </div>
    </div>
  );
}

/** Signal — bold masthead + dual rail + indexed timeline */
function SignalStructure({ ctx }: { ctx: Ctx }) {
  const header = find(ctx.sections, "header");
  const skills = find(ctx.sections, "skills");
  const certs = find(ctx.sections, "certs");
  const experience = find(ctx.sections, "experience");
  const skip = new Set(["header", "skills", "certs", "experience", "impact"]);
  return (
    <div className="structure-signal">
      <Wrap section={header} handlers={ctx.handlers} className="signal-mast">
        <HeaderBlock data={ctx.data} />
      </Wrap>
      <Wrap section={find(ctx.sections, "impact")} handlers={ctx.handlers}>
        <ImpactStrip metrics={ctx.metrics} />
      </Wrap>
      <div className="structure-signal-rail">
        <Wrap section={skills} handlers={ctx.handlers}>
          <section className="compose-block">
            <h2>{skills?.title || "Capability lattice"}</h2>
            <SkillsChips items={ctx.data.expertise} />
          </section>
        </Wrap>
        <Wrap section={certs} handlers={ctx.handlers}>
          {allCerts(ctx.data).length > 0 && (
            <section className="compose-block compose-block-accent">
              <h2>{certs?.title || "Credentials"}</h2>
              <ul className="compose-list">
                {allCerts(ctx.data).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}
        </Wrap>
      </div>
      <Wrap section={experience} handlers={ctx.handlers}>
        <section className="compose-block">
          <h2>{experience?.title || "Impact timeline"}</h2>
          {ctx.data.workExperience.map((job, i) => (
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
          ))}
        </section>
      </Wrap>
      <RestSections ctx={ctx} skip={skip} />
    </div>
  );
}

/** Mosaic — tile grid */
function MosaicStructure({ ctx }: { ctx: Ctx }) {
  return (
    <div className="structure-mosaic">
      {ctx.sections.map((section) => (
        <Wrap
          key={section.id}
          section={section}
          handlers={ctx.handlers}
          className={
            section.kind === "experience" ||
            section.kind === "skills" ||
            section.kind === "header"
              ? "mosaic-span-2"
              : ""
          }
        >
          {section.kind === "header" ? (
            <HeaderBlock data={ctx.data} />
          ) : (
            <SectionBody
              section={section}
              data={ctx.data}
              metrics={ctx.metrics}
            />
          )}
        </Wrap>
      ))}
    </div>
  );
}

/** Horizon — full-width stacked bands */
function HorizonStructure({ ctx }: { ctx: Ctx }) {
  return (
    <div className="structure-horizon">
      {ctx.sections.map((section) => (
        <Wrap
          key={section.id}
          section={section}
          handlers={ctx.handlers}
          className="horizon-band-block"
        >
          {section.kind === "header" ? (
            <HeaderBlock data={ctx.data} />
          ) : (
            <SectionBody
              section={section}
              data={ctx.data}
              metrics={ctx.metrics}
            />
          )}
        </Wrap>
      ))}
    </div>
  );
}

/** Atelier — editorial aside + main */
function AtelierStructure({ ctx }: { ctx: Ctx }) {
  const header = find(ctx.sections, "header");
  const skills = find(ctx.sections, "skills");
  const certs = find(ctx.sections, "certs");
  const skip = new Set(["header", "skills", "certs", "tools", "languages"]);
  const tools = find(ctx.sections, "tools");
  const languages = find(ctx.sections, "languages");
  return (
    <div className="structure-atelier">
      <aside className="structure-aside atelier-aside">
        <Wrap section={header} handlers={ctx.handlers}>
          <MonoBadge data={ctx.data} />
          <p className="compose-kicker">{ctx.data.technologyName}</p>
          <ContactLine data={ctx.data} />
        </Wrap>
        <Wrap section={skills} handlers={ctx.handlers}>
          <section>
            <h2>{skills?.title || "Toolkit"}</h2>
            <ol className="atelier-numbered">
              {ctx.data.expertise.map((s, i) => (
                <li key={s}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        </Wrap>
        <Wrap section={tools} handlers={ctx.handlers}>
          {(ctx.data.tools?.length || 0) > 0 && (
            <section>
              <h2>{tools?.title || "Tools"}</h2>
              <ul className="compose-list">
                {(ctx.data.tools || []).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}
        </Wrap>
        <Wrap section={certs} handlers={ctx.handlers}>
          {allCerts(ctx.data).length > 0 && (
            <section>
              <h2>{certs?.title || "Certified"}</h2>
              <ul className="compose-list">
                {allCerts(ctx.data).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}
        </Wrap>
        <Wrap section={languages} handlers={ctx.handlers}>
          {ctx.data.languages.length > 0 && (
            <section>
              <h2>{languages?.title || "Languages"}</h2>
              <ul className="compose-list">
                {ctx.data.languages.map((l) => (
                  <li key={l.name}>
                    {l.name} — {l.proficiency}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Wrap>
      </aside>
      <main className="structure-main atelier-main">
        <Wrap section={header} handlers={ctx.handlers}>
          <h1>{ctx.data.fullName}</h1>
          {ctx.data.headline && <p className="compose-headline">{ctx.data.headline}</p>}
        </Wrap>
        <Wrap section={find(ctx.sections, "impact")} handlers={ctx.handlers}>
          <ImpactStrip metrics={ctx.metrics} />
        </Wrap>
        <RestSections ctx={ctx} skip={skip} />
        {customs(ctx.sections).map((c) => (
          <Wrap key={c.id} section={c} handlers={ctx.handlers}>
            <SectionBody section={c} data={ctx.data} metrics={ctx.metrics} />
          </Wrap>
        ))}
      </main>
    </div>
  );
}

/** Pulse — stacked modules with spine */
function PulseStructure({ ctx }: { ctx: Ctx }) {
  return (
    <div className="structure-pulse">
      {ctx.sections.map((section, i) => (
        <Wrap
          key={section.id}
          section={section}
          handlers={ctx.handlers}
          className="pulse-mod"
        >
          {section.kind !== "header" && section.kind !== "impact" && (
            <div className="pulse-mod-label">
              {String(i + 1).padStart(2, "0")} · {section.title}
            </div>
          )}
          {section.kind === "header" ? (
            <HeaderBlock data={ctx.data} />
          ) : (
            <SectionBody
              section={section}
              data={ctx.data}
              metrics={ctx.metrics}
            />
          )}
        </Wrap>
      ))}
    </div>
  );
}
