import { ResumeIntakeForm } from "@/components/forms/ResumeIntakeForm";
import type { ThemeId } from "@/lib/types";

const VALID: ThemeId[] = ["servicenow", "salesforce", "aws", "azure"];

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const params = await searchParams;
  const theme = VALID.includes(params.theme as ThemeId)
    ? (params.theme as ThemeId)
    : "servicenow";

  return (
    <div className="page">
      <header className="page-header">
        <h1>New resume order</h1>
        <p>
          Paste or type client details below. Same fields map to your Google Form
          so every submission can land here automatically.
        </p>
      </header>
      <ResumeIntakeForm defaultTheme={theme} />
    </div>
  );
}
