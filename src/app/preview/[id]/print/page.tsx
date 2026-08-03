import { notFound } from "next/navigation";
import { ResumeRenderer } from "@/components/resumes/ResumeRenderer";
import { getResume } from "@/lib/storage";
import { PrintAuto } from "./PrintAuto";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
};

/** Resume-only view for Download PDF / email attachments (chrome hidden via CSS). */
export default async function PrintResumePage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const resume = await getResume(id);
  if (!resume) notFound();

  return (
    <div className="print-page">
      <style>{`
        .site-header, .no-print { display: none !important; }
        body, .site-shell, .site-main {
          background: #fff !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 0 !important;
        }
        .print-page { margin: 0; padding: 0; }
        .resume-sheet { box-shadow: none !important; margin: 0 auto; }
      `}</style>
      {query.autoprint === "1" ? <PrintAuto /> : null}
      <div className="resume-sheet print-root">
        <ResumeRenderer data={resume} />
      </div>
    </div>
  );
}
