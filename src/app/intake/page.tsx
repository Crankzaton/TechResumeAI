import { ResumeIntakeForm } from "@/components/forms/ResumeIntakeForm";

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ tech?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page">
      <header className="page-header">
        <h1>New resume order</h1>
        <p>
          Enter client details or paste LinkedIn-style content. Pick any
          technology from your admin catalog — one click builds the themed
          resume.
        </p>
      </header>
      <ResumeIntakeForm defaultTechnologyId={params.tech} />
    </div>
  );
}
