import { NextResponse } from "next/server";
import { listResumes } from "@/lib/storage";
import { buildSampleForTechnology, runResumeAgent } from "@/lib/agent";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sampleTech = searchParams.get("sample");
  if (sampleTech) {
    const resume = await buildSampleForTechnology(sampleTech);
    return NextResponse.json(resume);
  }
  const resumes = await listResumes();
  return NextResponse.json(resumes);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await runResumeAgent({
      body,
      formConnectionId: body.formConnectionId
        ? String(body.formConnectionId)
        : undefined,
      source: (body.source as "form" | "manual" | "agent") || "form",
      sendEmail: body.sendEmail === true,
    });
    return NextResponse.json(result.resume, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 },
    );
  }
}
