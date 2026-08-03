import type { ResumeData } from "@/lib/types";
import { ThemedResume } from "./ThemedResume";

/** All technologies render through the dynamic themed engine. */
export function ResumeRenderer({ data }: { data: ResumeData }) {
  return <ThemedResume data={data} />;
}
