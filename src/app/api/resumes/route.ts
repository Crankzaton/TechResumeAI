import { NextResponse } from "next/server";
import { createResume, listResumes } from "@/lib/storage";
import { normalizeFormBody } from "@/lib/map-form";
import { SAMPLE_RESUME } from "@/lib/sample-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("seed") === "sample") {
    const existing = await listResumes();
    const demo = existing.find((r) => r.fullName === SAMPLE_RESUME.fullName);
    if (demo) return NextResponse.json(demo);
    const created = await createResume({
      ...SAMPLE_RESUME,
      source: "manual",
      status: "previewed",
    });
    return NextResponse.json(created);
  }
  const resumes = await listResumes();
  return NextResponse.json(resumes);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = normalizeFormBody(body);
    if (!input.fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 },
      );
    }
    const resume = await createResume(input);
    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 },
    );
  }
}
