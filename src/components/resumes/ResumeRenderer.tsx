import type { ResumeData } from "@/lib/types";
import { AtelierResume } from "./AtelierResume";
import { HorizonResume } from "./HorizonResume";
import { MosaicResume } from "./MosaicResume";
import { PulseResume } from "./PulseResume";
import { SignalResume } from "./SignalResume";
import { ThemedResume } from "./ThemedResume";

/** Routes to a modular design template; classic keeps the original themed engine. */
export function ResumeRenderer({ data }: { data: ResumeData }) {
  switch (data.designTemplate || "classic") {
    case "signal":
      return <SignalResume data={data} />;
    case "mosaic":
      return <MosaicResume data={data} />;
    case "horizon":
      return <HorizonResume data={data} />;
    case "atelier":
      return <AtelierResume data={data} />;
    case "pulse":
      return <PulseResume data={data} />;
    case "classic":
    default:
      return <ThemedResume data={data} />;
  }
}
