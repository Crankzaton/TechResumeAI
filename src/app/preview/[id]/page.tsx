import { notFound } from "next/navigation";
import { ResumeRenderer } from "@/components/resumes/ResumeRenderer";
import { PreviewToolbar } from "@/components/preview/PreviewToolbar";
import { getResume, updateResume } from "@/lib/storage";

type Props = { params: Promise<{ id: string }> };

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const resume = await getResume(id);
  if (!resume) notFound();

  if (resume.status === "new") {
    await updateResume(id, { status: "previewed" });
    resume.status = "previewed";
  }

  return (
    <>
      <PreviewToolbar resume={resume} />
      <div className="preview-stage print-root">
        <div className="resume-sheet">
          <ResumeRenderer data={resume} />
        </div>
      </div>
    </>
  );
}
