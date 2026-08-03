import type { ResumeData } from "@/lib/types";
import { ensureSectionLayout } from "@/lib/resume-sections";
import {
  ComposableResume,
  type SectionHandlers,
} from "./ComposableResume";

/** Composable engine with structurally distinct templates per designTemplate. */
export function ResumeRenderer({
  data,
  handlers,
}: {
  data: ResumeData;
  handlers?: SectionHandlers;
}) {
  return (
    <ComposableResume
      data={{ ...data, sectionLayout: ensureSectionLayout(data) }}
      handlers={handlers}
    />
  );
}
