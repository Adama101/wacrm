import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createCrmAdmin, requireUserId } from "../lib/crm-db";
import {
  getPlaybook,
  listPlaybooks,
  VERTICAL_TAG_SCHEME,
  type OpsPersona,
  type OpsVertical,
} from "../skills/playbooks";

const verticalSchema = z.enum(["restaurant", "airline", "retail"]);
const personaSchema = z.enum(["manager", "staff"]);

async function ensureTag(
  supabase: ReturnType<typeof createCrmAdmin>,
  userId: string,
  name: string,
  color = "#64748b",
) {
  const { data: existing } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("user_id", userId)
    .ilike("name", name)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: userId, name, color })
    .select("id, name, color")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export const getOpsPlaybookTool = createTool({
  id: "get-ops-playbook",
  description:
    "Retrieve a sector playbook (open shift, IRROPS, store recovery, etc.) for manager or staff guidance.",
  inputSchema: z.object({
    vertical: verticalSchema,
    playbookId: z
      .string()
      .optional()
      .describe("Specific playbook id; omit to list all for the vertical"),
    persona: personaSchema.optional(),
  }),
  execute: async ({ vertical, playbookId, persona }) => {
    if (playbookId) {
      const playbook = getPlaybook(vertical, playbookId);
      if (!playbook) {
        return {
          found: false,
          available: listPlaybooks(vertical).map((p) => ({
            id: p.id,
            title: p.title,
          })),
        };
      }
      return { found: true, playbook };
    }
    return {
      found: true,
      playbooks: listPlaybooks(vertical, persona),
      recommendedTags: VERTICAL_TAG_SCHEME[vertical],
    };
  },
});

export const buildOpsBriefTool = createTool({
  id: "build-ops-brief",
  description:
    "Build a live operations companion brief for managers: inbox pressure, staff roster, open deals, and recent accountability notes.",
  inputSchema: z.object({
    vertical: verticalSchema,
    lookbackHours: z.number().int().min(1).max(72).optional().default(24),
  }),
  execute: async ({ vertical, lookbackHours }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const since = new Date(
      Date.now() - (lookbackHours ?? 24) * 3600_000,
    ).toISOString();

    const [{ data: conversations }, { data: deals }, { data: tags }] =
      await Promise.all([
        supabase
          .from("conversations")
          .select(
            "id, status, unread_count, last_message_text, last_message_at, contact:contacts(id, name, phone, company)",
          )
          .eq("user_id", userId)
          .in("status", ["open", "pending"])
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(20),
        supabase
          .from("deals")
          .select(
            "id, title, value, status, expected_close_date, contact:contacts(name, phone), stage:pipeline_stages(name)",
          )
          .eq("user_id", userId)
          .eq("status", "open")
          .order("updated_at", { ascending: false })
          .limit(15),
        supabase
          .from("tags")
          .select("id, name")
          .eq("user_id", userId)
          .in("name", [
            "Staff",
            "Accountability",
            "Incident",
            "FOH",
            "BOH",
            "Crew",
            "Ground",
            "Associate",
            "Shift-Lead",
            "IRROPS",
            "Guest",
            "Passenger",
            "Shopper",
          ]),
      ]);

    const staffTagIds = (tags ?? [])
      .filter((t) =>
        ["Staff", "FOH", "BOH", "Crew", "Ground", "Associate", "Shift-Lead"].includes(
          t.name,
        ),
      )
      .map((t) => t.id);

    let staff: Array<{
      id: string;
      name: string | null;
      phone: string;
      company: string | null;
      tags: string[];
    }> = [];

    if (staffTagIds.length) {
      const { data: staffLinks } = await supabase
        .from("contact_tags")
        .select("contact_id, tags(name), contacts(id, name, phone, company)")
        .in("tag_id", staffTagIds);

      const byId = new Map<
        string,
        {
          id: string;
          name: string | null;
          phone: string;
          company: string | null;
          tags: Set<string>;
        }
      >();
      for (const row of staffLinks ?? []) {
        const c = row.contacts as unknown as {
          id: string;
          name: string | null;
          phone: string;
          company: string | null;
        } | null;
        if (!c) continue;
        const entry = byId.get(c.id) ?? {
          id: c.id,
          name: c.name,
          phone: c.phone,
          company: c.company,
          tags: new Set<string>(),
        };
        const tagName = (row.tags as unknown as { name: string } | null)?.name;
        if (tagName) entry.tags.add(tagName);
        byId.set(c.id, entry);
      }
      staff = [...byId.values()].map((s) => ({
        ...s,
        tags: [...s.tags],
      }));
    }

    const staffIds = staff.map((s) => s.id);
    let accountabilityNotes: Array<{
      contact_id: string;
      note_text: string;
      created_at: string;
    }> = [];
    if (staffIds.length) {
      const { data: notes } = await supabase
        .from("contact_notes")
        .select("contact_id, note_text, created_at")
        .in("contact_id", staffIds)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(30);
      accountabilityNotes = (notes ?? []).filter((n) =>
        /\[(TASK|DONE|BLOCKED|INCIDENT|CHECK-IN)\]/i.test(n.note_text),
      );
    }

    const unread = (conversations ?? []).reduce(
      (sum, c) => sum + (c.unread_count ?? 0),
      0,
    );
    const openTasks = accountabilityNotes.filter((n) =>
      /\[TASK\]/i.test(n.note_text),
    );
    const doneTasks = accountabilityNotes.filter((n) =>
      /\[DONE\]/i.test(n.note_text),
    );
    const blocked = accountabilityNotes.filter((n) =>
      /\[BLOCKED\]/i.test(n.note_text),
    );

    return {
      vertical,
      generatedAt: new Date().toISOString(),
      lookbackHours: lookbackHours ?? 24,
      inbox: {
        openOrPending: conversations?.length ?? 0,
        unreadTotal: unread,
        hotThreads: (conversations ?? [])
          .filter((c) => (c.unread_count ?? 0) > 0)
          .slice(0, 8),
      },
      pipelineOpen: deals ?? [],
      staffRoster: staff,
      accountability: {
        openTaskNotes: openTasks.length,
        doneNotes: doneTasks.length,
        blockedNotes: blocked.length,
        recent: accountabilityNotes.slice(0, 12),
      },
      recommendedTags: VERTICAL_TAG_SCHEME[vertical],
      managerFocus: [
        unread > 0
          ? `Clear ${unread} unread WhatsApp messages first`
          : "Inbox is clear — protect focus time for floor/station walks",
        blocked.length
          ? `${blocked.length} blocked staff tasks need unblock decisions`
          : "No blocked staff tasks in the lookback window",
        openTasks.length
          ? `${openTasks.length} open [TASK] items still outstanding`
          : "No open [TASK] accountability items logged recently",
      ],
    };
  },
});

export const listStaffRosterTool = createTool({
  id: "list-staff-roster",
  description:
    "List contacts tagged as staff/roles (Staff, FOH, Crew, Associate, Shift-Lead, etc.).",
  inputSchema: z.object({
    roleTag: z
      .string()
      .optional()
      .describe("Optional role filter, e.g. FOH, Crew, Associate"),
  }),
  execute: async ({ roleTag }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const roleNames = roleTag
      ? [roleTag, "Staff"]
      : [
          "Staff",
          "FOH",
          "BOH",
          "Crew",
          "Ground",
          "Associate",
          "Stock",
          "Shift-Lead",
          "Station-Lead",
        ];

    const { data: tags } = await supabase
      .from("tags")
      .select("id, name")
      .eq("user_id", userId)
      .in("name", roleNames);
    if (!tags?.length) return { staff: [], hint: "No staff role tags found yet" };

    const { data: links } = await supabase
      .from("contact_tags")
      .select("tags(name), contacts(id, name, phone, email, company)")
      .in(
        "tag_id",
        tags.map((t) => t.id),
      );

    const byId = new Map<
      string,
      {
        id: string;
        name: string | null;
        phone: string;
        email: string | null;
        company: string | null;
        roles: Set<string>;
      }
    >();
    for (const row of links ?? []) {
      const c = row.contacts as unknown as {
        id: string;
        name: string | null;
        phone: string;
        email: string | null;
        company: string | null;
      } | null;
      if (!c) continue;
      const entry = byId.get(c.id) ?? {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        company: c.company,
        roles: new Set<string>(),
      };
      const tagName = (row.tags as unknown as { name: string } | null)?.name;
      if (tagName) entry.roles.add(tagName);
      byId.set(c.id, entry);
    }

    let staff = [...byId.values()].map((s) => ({
      ...s,
      roles: [...s.roles],
    }));
    if (roleTag) {
      const wanted = roleTag.toLowerCase();
      staff = staff.filter((s) =>
        s.roles.some((r) => r.toLowerCase() === wanted),
      );
    }
    return { staff };
  },
});

export const assignAccountabilityTaskTool = createTool({
  id: "assign-accountability-task",
  description:
    "Assign a staff accountability task: tags the contact, writes a [TASK] note with due time, and returns a WhatsApp nudge draft.",
  inputSchema: z.object({
    contactId: z.string().uuid(),
    task: z.string().min(3),
    dueInMinutes: z.number().int().min(5).max(24 * 60).optional().default(60),
    vertical: verticalSchema.optional(),
  }),
  execute: async ({ contactId, task, dueInMinutes, vertical }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, name, phone")
      .eq("id", contactId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!contact) throw new Error("Staff contact not found");

    const dueAt = new Date(
      Date.now() + (dueInMinutes ?? 60) * 60_000,
    ).toISOString();
    const noteText = `[TASK] due=${dueAt} | ${task}`;

    const [staffTag, accountabilityTag] = await Promise.all([
      ensureTag(supabase, userId, "Staff", "#0ea5e9"),
      ensureTag(supabase, userId, "Accountability", "#f97316"),
    ]);

    await supabase.from("contact_tags").upsert(
      [
        { contact_id: contactId, tag_id: staffTag.id },
        { contact_id: contactId, tag_id: accountabilityTag.id },
      ],
      { onConflict: "contact_id,tag_id" },
    );

    const { data: note, error } = await supabase
      .from("contact_notes")
      .insert({
        contact_id: contactId,
        user_id: userId,
        note_text: noteText,
      })
      .select("id, note_text, created_at")
      .single();
    if (error) throw new Error(error.message);

    const firstName = contact.name?.split(" ")[0] || "team";
    const nudge = `Hi ${firstName} — accountability check: "${task}". Please confirm DONE or BLOCKED before ${new Date(dueAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Reply here.`;

    return {
      ok: true,
      contact,
      note,
      dueAt,
      whatsappNudgeDraft: nudge,
      vertical: vertical ?? null,
      staffReplyHint:
        "Staff should reply or ask the agent to log [DONE] / [BLOCKED] with reason.",
    };
  },
});

export const logStaffCheckInTool = createTool({
  id: "log-staff-check-in",
  description:
    "Log a staff accountability update as [DONE], [BLOCKED], [CHECK-IN], or [INCIDENT] on their contact record.",
  inputSchema: z.object({
    contactId: z.string().uuid(),
    status: z.enum(["DONE", "BLOCKED", "CHECK-IN", "INCIDENT"]),
    summary: z.string().min(2),
    relatedTask: z.string().optional(),
    severity: z.enum(["low", "medium", "high"]).optional(),
  }),
  execute: async (
    { contactId, status, summary, relatedTask, severity },
    context,
  ) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, name, phone")
      .eq("id", contactId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!contact) throw new Error("Contact not found");

    const parts = [`[${status}]`];
    if (relatedTask) parts.push(`task=${relatedTask}`);
    if (severity) parts.push(`severity=${severity}`);
    parts.push(summary);
    const noteText = parts.join(" | ");

    const tagsToApply = ["Accountability"];
    if (status === "INCIDENT") tagsToApply.push("Incident");

    for (const name of tagsToApply) {
      const tag = await ensureTag(
        supabase,
        userId,
        name,
        name === "Incident" ? "#ef4444" : "#f97316",
      );
      await supabase
        .from("contact_tags")
        .upsert(
          { contact_id: contactId, tag_id: tag.id },
          { onConflict: "contact_id,tag_id" },
        );
    }

    const { data: note, error } = await supabase
      .from("contact_notes")
      .insert({
        contact_id: contactId,
        user_id: userId,
        note_text: noteText,
      })
      .select("id, note_text, created_at")
      .single();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      contact,
      note,
      managerAlert:
        status === "BLOCKED" || status === "INCIDENT" || severity === "high",
    };
  },
});

export const listOpenAccountabilityTool = createTool({
  id: "list-open-accountability",
  description:
    "List recent [TASK]/[DONE]/[BLOCKED]/[INCIDENT] notes for staff accountability tracking.",
  inputSchema: z.object({
    hours: z.number().int().min(1).max(168).optional().default(48),
    statusPrefix: z
      .enum(["TASK", "DONE", "BLOCKED", "INCIDENT", "CHECK-IN", "ANY"])
      .optional()
      .default("ANY"),
  }),
  execute: async ({ hours, statusPrefix }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const since = new Date(Date.now() - (hours ?? 48) * 3600_000).toISOString();

    const { data: notes, error } = await supabase
      .from("contact_notes")
      .select(
        "id, note_text, created_at, contact:contacts(id, name, phone, company)",
      )
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw new Error(error.message);

    const filtered = (notes ?? []).filter((n) => {
      if (!/\[(TASK|DONE|BLOCKED|INCIDENT|CHECK-IN)\]/i.test(n.note_text)) {
        return false;
      }
      if (!statusPrefix || statusPrefix === "ANY") return true;
      return n.note_text.toUpperCase().includes(`[${statusPrefix}]`);
    });

    return { items: filtered, count: filtered.length };
  },
});

export const draftCustomerOpsReplyTool = createTool({
  id: "draft-customer-ops-reply",
  description:
    "Draft a WhatsApp reply for a guest/passenger/shopper using the live conversation thread and vertical tone.",
  inputSchema: z.object({
    conversationId: z.string().uuid(),
    vertical: verticalSchema,
    persona: personaSchema.optional().default("staff"),
    intent: z
      .string()
      .optional()
      .describe("Desired outcome, e.g. delay update, table wait, BOPIS ready"),
  }),
  execute: async ({ conversationId, vertical, persona, intent }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select(
        "id, status, contact:contacts(id, name, phone, company)",
      )
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!conversation) throw new Error("Conversation not found");

    const { data: messages } = await supabase
      .from("messages")
      .select("sender_type, content_text, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10);

    const contact = conversation.contact as unknown as {
      name: string | null;
      phone: string;
      company: string | null;
    } | null;

    const thread = (messages ?? [])
      .slice()
      .reverse()
      .map((m) => `${m.sender_type}: ${m.content_text ?? ""}`)
      .join("\n");

    const tone: Record<OpsVertical, string> = {
      restaurant: "warm hospitality, concise, solution-first",
      airline: "calm, precise, time-bound next update, no speculation",
      retail: "friendly retail associate, clear next step for pickup/return",
    };

    return {
      conversationId,
      contact,
      vertical,
      persona: (persona ?? "staff") as OpsPersona,
      tone: tone[vertical],
      intent: intent ?? null,
      thread,
      draftingGuidance: [
        "Return a single WhatsApp-ready message under 400 characters when possible",
        "Include a concrete next step and timing when relevant",
        "Do not invent compensation, flight times, or inventory not in the thread",
        persona === "manager"
          ? "You may authorize policy-level remedies in the draft for human approval"
          : "Stay within standard staff policy; escalate edge cases to a manager",
      ],
    };
  },
});

export const sendWhatsAppMessageTool = createTool({
  id: "send-whatsapp-message",
  description:
    "Send a WhatsApp text to a contact as Meridian bot (staff nudges, guest updates, peer handoffs). Use when you need to message someone other than the current chat, or to deliver a nudge after assigning a task.",
  inputSchema: z.object({
    contactId: z.string().uuid(),
    text: z.string().min(1).max(4000),
  }),
  execute: async ({ contactId, text }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, name, phone")
      .eq("id", contactId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!contact) throw new Error("Contact not found");

    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("contact_id", contactId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (!conversation) {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          contact_id: contactId,
          status: "open",
          unread_count: 0,
        })
        .select("id")
        .single();
      if (error || !created) throw new Error(error?.message ?? "Failed to open conversation");
      conversation = created;
    }

    const { engineSendText } = await import("@/lib/automations/meta-send");
    const { whatsapp_message_id } = await engineSendText({
      userId,
      conversationId: conversation.id,
      contactId,
      text,
    });

    return {
      ok: true,
      contact,
      conversationId: conversation.id,
      whatsapp_message_id,
    };
  },
});

export const opsSkillsTools = {
  getOpsPlaybookTool,
  buildOpsBriefTool,
  listStaffRosterTool,
  assignAccountabilityTaskTool,
  logStaffCheckInTool,
  listOpenAccountabilityTool,
  draftCustomerOpsReplyTool,
  sendWhatsAppMessageTool,
};
