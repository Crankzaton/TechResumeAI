import { NextResponse } from "next/server";
import { deleteResume, getResume, updateResume } from "@/lib/storage";
import { reEmailResume } from "@/lib/agent";
import type { ResumeData } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const resume = await getResume(id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(resume);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as Partial<ResumeData> & {
    action?: string;
  };

  if (body.action === "email") {
    try {
      const result = await reEmailResume(id);
      return NextResponse.json({ resume: result.resume, email: result });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Email failed" },
        { status: 400 },
      );
    }
  }

  if (body.action === "redesign") {
    try {
      const { redesignResume } = await import("@/lib/agent");
      const result = await redesignResume({
        idOrNumber: id,
        technology: body.technologyName || (body as { technology?: string }).technology,
        layout: body.layout,
        sendEmail: true,
      });
      return NextResponse.json({ resume: result.resume, email: result });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Redesign failed" },
        { status: 400 },
      );
    }
  }

  const updated = await updateResume(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ok = await deleteResume(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
