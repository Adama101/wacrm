import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSectorAgent } from "@/lib/agents/run";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { conversationId?: string; sectorId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conversationId = body.conversationId?.trim();
  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  const { data: conversation, error: convErr } = await supabase
    .from("conversations")
    .select(
      "id, status, contact:contacts(id, name, phone, company)",
    )
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (convErr) {
    return NextResponse.json({ error: convErr.message }, { status: 500 });
  }
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: messages, error: msgErr } = await supabase
    .from("messages")
    .select("sender_type, content_text, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(12);
  if (msgErr) {
    return NextResponse.json({ error: msgErr.message }, { status: 500 });
  }

  const contactRaw = conversation.contact as
    | { id: string; name: string | null; phone: string; company: string | null }
    | { id: string; name: string | null; phone: string; company: string | null }[]
    | null;
  const contact = Array.isArray(contactRaw) ? contactRaw[0] : contactRaw;

  const thread = (messages ?? [])
    .slice()
    .reverse()
    .map((m) => `${m.sender_type}: ${m.content_text ?? ""}`)
    .join("\n");

  const sectorId = body.sectorId ?? "support";
  const result = await runSectorAgent({
    sectorId,
    userId: user.id,
    message:
      "Draft a single WhatsApp reply the human agent can send next. Return ONLY the reply text — no quotes, no preamble, no bullet list.",
    contextBlock: [
      `Conversation ID: ${conversation.id}`,
      `Status: ${conversation.status}`,
      `Contact: ${contact?.name ?? "Unknown"} (${contact?.phone ?? "n/a"})`,
      `Company: ${contact?.company ?? "n/a"}`,
      "Recent thread:",
      thread || "(no messages)",
    ].join("\n"),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  const draft = result.text
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^(here'?s (a |the )?draft:?\s*)/i, "");

  return NextResponse.json({
    draft,
    sector: { id: result.sector.id, name: result.sector.name },
  });
}
