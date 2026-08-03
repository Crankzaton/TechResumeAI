import { ResumeIntakeForm } from "@/components/forms/ResumeIntakeForm";

export default function IntakePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>New resume</h1>
        <p>
          Enter name, technology, contact, skills and experience — or upload
          resume files below (each file can use a different technology).
        </p>
      </header>
      <ResumeIntakeForm />
    </div>
  );
}
