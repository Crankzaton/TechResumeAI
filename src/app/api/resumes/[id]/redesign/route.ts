import { NextResponse } from "next/server";
import { redesignResume } from "@/lib/agent";
import type { LayoutStyle } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

/** POST /api/resumes/:id/redesign — id can be TR-1042 or internal id */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      technology?: string;
      layout?: LayoutStyle;
      sendEmail?: boolean;
    };

    const result = await redesignResume({
      idOrNumber: id,
      technology: body.technology,
      layout: body.layout,
      sendEmail: body.sendEmail ?? true,
    });

    return NextResponse.json({
      ok: true,
      resumeNumber: result.resume.resumeNumber,
      designVersion: result.resume.designVersion,
      previewUrl: `/preview/${result.resume.id}`,
      technology: result.resume.technologyName,
      layout: result.resume.layout,
      emailSent: result.emailSent,
      emailError: result.emailError,
      emailPreview: result.emailPreview,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Redesign failed" },
      { status: 400 },
    );
  }
}
