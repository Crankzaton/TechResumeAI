import { NextResponse } from "next/server";
import {
  addAgentEvent,
  createFormConnection,
  deleteFormConnection,
  listFormConnections,
  updateFormConnection,
} from "@/lib/storage";
import type { FormConnectionInput } from "@/lib/types";
import { nanoid } from "nanoid";

export async function GET() {
  return NextResponse.json(await listFormConnections());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<FormConnectionInput> & {
      name: string;
      technologyId: string;
    };
    if (!body.name?.trim() || !body.technologyId) {
      return NextResponse.json(
        { error: "name and technologyId are required" },
        { status: 400 },
      );
    }

    const item = await createFormConnection({
      name: body.name.trim(),
      technologyId: body.technologyId,
      googleFormUrl: body.googleFormUrl || "",
      formIdHint: body.formIdHint || "",
      fieldMapNotes: body.fieldMapNotes || "",
      webhookSecret: body.webhookSecret || nanoid(16),
      active: body.active ?? true,
    });

    await addAgentEvent({
      type: "form_linked",
      message: `Google Form linked: ${item.name}`,
      technologyId: item.technologyId,
      meta: { formId: item.id },
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
  const body = (await request.json()) as { id: string } & Partial<FormConnectionInput>;
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const updated = await updateFormConnection(body.id, body);
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
  const ok = await deleteFormConnection(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
