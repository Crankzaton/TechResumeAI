import { notFound } from "next/navigation";
import { PreviewWorkspace } from "@/components/preview/PreviewWorkspace";
import { getResume, listTechnologies, updateResume } from "@/lib/storage";

type Props = { params: Promise<{ id: string }> };

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const resume = await getResume(id);
  if (!resume) notFound();

  if (resume.status === "new" || resume.status === "ready") {
    await updateResume(id, { status: "previewed" });
    resume.status = "previewed";
  }

  const technologies = (await listTechnologies()).filter((t) => t.active);

  return <PreviewWorkspace resume={resume} technologies={technologies} />;
}
