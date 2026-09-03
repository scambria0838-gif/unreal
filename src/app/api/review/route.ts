import { NextResponse } from "next/server";
import { triageSchema } from "@/lib/triage";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = triageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid review." }, { status: 400 });
  }

  console.info("[jls-review]", {
    name: parsed.data.name,
    phone: parsed.data.phone,
    city: parsed.data.city,
    occupancy: parsed.data.occupancy,
    redTag: parsed.data.redTag,
    stopWork: parsed.data.stopWork,
    focus: parsed.data.focus,
  });

  return NextResponse.json({ ok: true });
}
