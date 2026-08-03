import { NextResponse } from "next/server";
import {
  createTechnology,
  listTechnologies,
  updateTechnology,
  deleteTechnology,
  addAgentEvent,
} from "@/lib/storage";
import { slugify } from "@/lib/default-technologies";
import type { LayoutStyle, TechnologyInput } from "@/lib/types";

export async function GET() {
  const technologies = await listTechnologies();
  return NextResponse.json(technologies);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<TechnologyInput> & {
      name: string;
    };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const item = await createTechnology({
      name: body.name.trim(),
      slug: body.slug || slugify(body.name),
      tagline: body.tagline || `${body.name} themed resume`,
      description:
        body.description ||
        `Custom ${body.name} technology theme managed from admin.`,
      layout: (body.layout as LayoutStyle) || "modern-clean",
      colors: body.colors || {
        background: "#0f172a",
        surface: "#1e293b",
        accent: "#38bdf8",
        accentText: "#0f172a",
        text: "#f8fafc",
        muted: "#94a3b8",
        cardHeader: "#0369a1",
        cardBody: "#e2e8f0",
        sidebar: "#020617",
      },
      active: body.active ?? true,
    });

    await addAgentEvent({
      type: "tech_created",
      message: `Technology added: ${item.name}`,
      technologyId: item.id,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id: string } & Partial<TechnologyInput>;
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const updated = await updateTechnology(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const ok = await deleteTechnology(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
