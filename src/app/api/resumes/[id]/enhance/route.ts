import { NextResponse } from "next/server";
import { getResume, updateResume } from "@/lib/storage";
import { enhanceResumeContent } from "@/lib/ai-enhance";
import { nextLayout } from "@/lib/design-variants";
import { layoutAccentPalette } from "@/lib/design-variants";

type Params = { params: Promise<{ id: string }> };

/** POST /api/resumes/:id/enhance — AI rewrite + structural redesign */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await getResume(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { patch, summary } = enhanceResumeContent(existing);
    const layout = nextLayout(
      existing.layout,
      existing.previousLayouts || [],
    );
    const themeColors = layoutAccentPalette(layout, existing.themeColors);

    const updated = await updateResume(existing.id, {
      ...patch,
      layout,
      themeColors,
      chipStyle: "soft",
      chipColors: undefined,
      previousLayouts: [...(existing.previousLayouts || []), existing.layout].slice(
        -8,
      ),
      previousTemplates: [
        ...(existing.previousTemplates || []),
        existing.designTemplate || "classic",
      ].slice(-8),
      status: "ready",
    });

    return NextResponse.json({
      ok: true,
      resume: updated,
      message: summary,
      designTemplate: updated?.designTemplate,
      layout: updated?.layout,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enhance failed" },
      { status: 400 },
    );
  }
}
