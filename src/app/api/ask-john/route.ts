import { NextResponse } from "next/server";
import { z } from "zod";
import { replyTo, type ConciergeMessage } from "@/lib/concierge";

const payload = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = payload.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
  }

  const messages = parsed.data.messages as ConciergeMessage[];
  const incoming = [...messages].reverse().find((message) => message.role === "user");

  if (!incoming) {
    return NextResponse.json({ error: "No user message." }, { status: 400 });
  }

  const history = messages.slice(0, -1);
  const result = replyTo(history, incoming.content);

  if (result.leadReady) {
    console.info("[jls-ask-john-lead]", result.lead);
  }

  return NextResponse.json({
    reply: result.reply,
    category: result.category,
    leadReady: result.leadReady,
  });
}
