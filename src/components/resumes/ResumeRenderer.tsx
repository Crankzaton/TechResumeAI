import type { ResumeData } from "@/lib/types";
import { ComposableResume, type SectionHandlers } from "./ComposableResume";

/** All technologies render through the composable engine (skins + section order). */
export function ResumeRenderer({
  data,
  handlers,
}: {
  data: ResumeData;
  handlers?: SectionHandlers;
}) {
  return <ComposableResume data={data} handlers={handlers} />;
}
