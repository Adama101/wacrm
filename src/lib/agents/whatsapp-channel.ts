import { engineSendText } from "@/lib/automations/meta-send";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { runSectorAgent } from "@/lib/agents/run";
import { resolveWhatsAppAgentRole } from "@/lib/agents/resolve-wa-role";

function whatsappAgentEnabled(): boolean {
  const raw = process.env.WHATSAPP_AGENT_ENABLED;
  if (raw == null || raw === "") return true;
  return !["0", "false", "off", "no"].includes(raw.toLowerCase());
}

/** Strip markdown the model might emit — WhatsApp is plain text. */
export function toWhatsAppText(input: string): string {
  return input
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 4000);
}

async function loadContactTags(
  userId: string,
  contactId: string,
): Promise<string[]> {
  const db = supabaseAdmin();
  const { data: contact } = await db
    .from("contacts")
    .select("id")
    .eq("id", contactId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!contact) return [];

  const { data, error } = await db
    .from("contact_tags")
    .select("tags(name)")
    .eq("contact_id", contactId);
  if (error) {
    console.error("[wa-agent] tag load failed:", error.message);
    return [];
  }
  return (data ?? [])
    .map((row) => (row.tags as unknown as { name: string } | null)?.name)
    .filter((n): n is string => Boolean(n));
}

/**
 * Returns true when the inbound message was claimed by the WhatsApp
 * agent channel (staff/manager). Callers should suppress content-level
 * automations the same way Flows do when consumed.
 */
export async function tryDispatchWhatsAppAgent(args: {
  userId: string;
  contactId: string;
  conversationId: string;
  inboundText: string;
}): Promise<{ consumed: boolean }> {
  if (!whatsappAgentEnabled()) return { consumed: false };

  const text = args.inboundText.trim();
  if (!text) return { consumed: false };

  const tags = await loadContactTags(args.userId, args.contactId);
  const role = resolveWhatsAppAgentRole(tags);
  if (!role.enabled) return { consumed: false };

  // Claim the message immediately so automations don't race the agent.
  void handleWhatsAppAgentTurn({
    ...args,
    inboundText: text,
    persona: role.persona,
    sectorId: role.sectorId,
    tags: role.tags,
  }).catch((err) =>
    console.error("[wa-agent] turn failed:", err instanceof Error ? err.message : err),
  );

  return { consumed: true };
}

async function handleWhatsAppAgentTurn(args: {
  userId: string;
  contactId: string;
  conversationId: string;
  inboundText: string;
  persona: "manager" | "staff";
  sectorId: string;
  tags: string[];
}) {
  const db = supabaseAdmin();
  const { data: contact } = await db
    .from("contacts")
    .select("id, name, phone, company")
    .eq("id", args.contactId)
    .eq("user_id", args.userId)
    .maybeSingle();

  const { data: recent } = await db
    .from("messages")
    .select("sender_type, content_text, created_at")
    .eq("conversation_id", args.conversationId)
    .order("created_at", { ascending: false })
    .limit(8);

  const thread = (recent ?? [])
    .slice()
    .reverse()
    .map((m) => `${m.sender_type}: ${m.content_text ?? ""}`)
    .join("\n");

  const channelPreamble =
    args.persona === "staff"
      ? `Channel: WhatsApp (staff-first). You are speaking directly to this staff member on WhatsApp. Your final reply is sent to them automatically. Execute tools yourself — don't ask them to open the web app. Keep replies short, actionable, and WhatsApp-native (no markdown).`
      : `Channel: WhatsApp (manager). Managers primarily use the Meridian web app, but this message arrived on WhatsApp — treat it as a full ops command channel. Execute tools, then reply with a concise WhatsApp update. They can also review the same workspace in the admin webapp.`;

  const result = await runSectorAgent({
    sectorId: args.sectorId,
    userId: args.userId,
    persona: args.persona,
    channel: "whatsapp",
    contactId: args.contactId,
    conversationId: args.conversationId,
    message: args.inboundText,
    contextBlock: [
      channelPreamble,
      `Contact: ${contact?.name ?? "Unknown"} (${contact?.phone ?? "n/a"})`,
      `Company: ${contact?.company ?? "n/a"}`,
      `Tags: ${args.tags.join(", ") || "none"}`,
      `Conversation ID: ${args.conversationId}`,
      "Recent thread:",
      thread || "(empty)",
    ].join("\n"),
  });

  const reply = result.ok
    ? toWhatsAppText(result.text)
    : toWhatsAppText(
        `I hit a snag running that (${"error" in result ? result.error : "unknown"}). Try again in a moment, or open Meridian on the web.`,
      );

  if (!reply) return;

  await engineSendText({
    userId: args.userId,
    conversationId: args.conversationId,
    contactId: args.contactId,
    text: reply,
  });

  // Staff/manager bot threads shouldn't inflate unread for the human inbox.
  await db
    .from("conversations")
    .update({ unread_count: 0, updated_at: new Date().toISOString() })
    .eq("id", args.conversationId)
    .eq("user_id", args.userId);
}
