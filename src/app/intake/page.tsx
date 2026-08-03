import { ResumeIntakeForm } from "@/components/forms/ResumeIntakeForm";

export default function IntakePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>New resume</h1>
        <p>
          Fill every section you want on the resume — summary, skills, tools,
          experience, projects, education, certs, awards, and more. Your draft
          auto-saves if you leave and come back.
        </p>
      </header>
      <ResumeIntakeForm />
    </div>
  );
}
