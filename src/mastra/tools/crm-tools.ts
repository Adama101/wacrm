import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createCrmAdmin, requireUserId } from "../lib/crm-db";

export const searchContactsTool = createTool({
  id: "search-contacts",
  description:
    "Search the authenticated user's CRM contacts by name, phone, email, or company.",
  inputSchema: z.object({
    query: z.string().min(1).describe("Search text"),
    limit: z.number().int().min(1).max(25).optional().default(10),
  }),
  execute: async ({ query, limit }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const safe = query.replace(/[%_,.()"'\\]/g, " ").trim();
    if (!safe) return { contacts: [] };
    const pattern = `%${safe}%`;
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, phone, email, company, created_at")
      .eq("user_id", userId)
      .or(
        `name.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern},company.ilike.${pattern}`,
      )
      .order("updated_at", { ascending: false })
      .limit(limit ?? 10);
    if (error) throw new Error(error.message);
    return { contacts: data ?? [] };
  },
});

export const getContactTool = createTool({
  id: "get-contact",
  description: "Load a contact with tags and recent notes.",
  inputSchema: z.object({
    contactId: z.string().uuid().optional(),
    phone: z.string().optional(),
  }),
  execute: async ({ contactId, phone }, context) => {
    const userId = requireUserId(context);
    if (!contactId && !phone) {
      throw new Error("Provide contactId or phone");
    }
    const supabase = createCrmAdmin();
    let query = supabase
      .from("contacts")
      .select("id, name, phone, email, company, created_at, updated_at")
      .eq("user_id", userId)
      .limit(1);
    query = contactId ? query.eq("id", contactId) : query.eq("phone", phone!);
    const { data: contact, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    if (!contact) return { contact: null };

    const [{ data: tagRows }, { data: notes }] = await Promise.all([
      supabase
        .from("contact_tags")
        .select("tags(id, name, color)")
        .eq("contact_id", contact.id),
      supabase
        .from("contact_notes")
        .select("id, note_text, created_at")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      contact,
      tags: (tagRows ?? []).map((r) => r.tags).filter(Boolean),
      notes: notes ?? [],
    };
  },
});

export const listConversationsTool = createTool({
  id: "list-conversations",
  description:
    "List recent WhatsApp conversations with status, unread count, and last message.",
  inputSchema: z.object({
    status: z.enum(["open", "pending", "closed", "any"]).optional().default("any"),
    limit: z.number().int().min(1).max(30).optional().default(15),
  }),
  execute: async ({ status, limit }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    let query = supabase
      .from("conversations")
      .select(
        "id, status, unread_count, last_message_text, last_message_at, contact:contacts(id, name, phone, company)",
      )
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(limit ?? 15);
    if (status && status !== "any") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { conversations: data ?? [] };
  },
});

export const getConversationThreadTool = createTool({
  id: "get-conversation-thread",
  description:
    "Fetch a conversation's recent messages plus contact details for reply drafting.",
  inputSchema: z.object({
    conversationId: z.string().uuid(),
    limit: z.number().int().min(1).max(50).optional().default(20),
  }),
  execute: async ({ conversationId, limit }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data: conversation, error: convErr } = await supabase
      .from("conversations")
      .select(
        "id, status, unread_count, last_message_text, last_message_at, contact:contacts(id, name, phone, email, company)",
      )
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (convErr) throw new Error(convErr.message);
    if (!conversation) return { conversation: null, messages: [] };

    const { data: messages, error: msgErr } = await supabase
      .from("messages")
      .select("id, sender_type, content_text, status, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (msgErr) throw new Error(msgErr.message);

    return {
      conversation,
      messages: (messages ?? []).reverse(),
    };
  },
});

export const listPipelineDealsTool = createTool({
  id: "list-pipeline-deals",
  description: "List deals across pipelines with stage, value, and contact.",
  inputSchema: z.object({
    status: z.enum(["open", "won", "lost", "any"]).optional().default("open"),
    limit: z.number().int().min(1).max(40).optional().default(20),
  }),
  execute: async ({ status, limit }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    let query = supabase
      .from("deals")
      .select(
        "id, title, value, currency, status, expected_close_date, notes, stage:pipeline_stages(id, name, color), contact:contacts(id, name, phone, company), pipeline:pipelines(id, name)",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit ?? 20);
    if (status && status !== "any") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { deals: data ?? [] };
  },
});

export const createDealTool = createTool({
  id: "create-deal",
  description:
    "Create a new open deal on the user's first pipeline (or a named pipeline).",
  inputSchema: z.object({
    title: z.string().min(1),
    contactId: z.string().uuid(),
    value: z.number().nonnegative().optional().default(0),
    currency: z.string().optional().default("USD"),
    stageName: z
      .string()
      .optional()
      .describe("Stage name to place the deal in; defaults to first stage"),
    pipelineName: z.string().optional(),
    notes: z.string().optional(),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();

    let pipeQuery = supabase
      .from("pipelines")
      .select("id, name")
      .eq("user_id", userId)
      .limit(1);
    if (input.pipelineName) {
      pipeQuery = supabase
        .from("pipelines")
        .select("id, name")
        .eq("user_id", userId)
        .ilike("name", input.pipelineName)
        .limit(1);
    }
    const { data: pipeline, error: pipeErr } = await pipeQuery.maybeSingle();
    if (pipeErr) throw new Error(pipeErr.message);
    if (!pipeline) throw new Error("No pipeline found for this user");

    const { data: stages, error: stageErr } = await supabase
      .from("pipeline_stages")
      .select("id, name, position")
      .eq("pipeline_id", pipeline.id)
      .order("position", { ascending: true });
    if (stageErr) throw new Error(stageErr.message);
    if (!stages?.length) throw new Error("Pipeline has no stages");

    const stage =
      (input.stageName
        ? stages.find(
            (s) => s.name.toLowerCase() === input.stageName!.toLowerCase(),
          )
        : null) ?? stages[0];

    const { data: deal, error } = await supabase
      .from("deals")
      .insert({
        user_id: userId,
        pipeline_id: pipeline.id,
        stage_id: stage.id,
        contact_id: input.contactId,
        title: input.title,
        value: input.value ?? 0,
        currency: input.currency ?? "USD",
        notes: input.notes ?? null,
        status: "open",
      })
      .select("id, title, value, currency, status")
      .single();
    if (error) throw new Error(error.message);
    return { deal, stage: stage.name, pipeline: pipeline.name };
  },
});

export const addContactTagTool = createTool({
  id: "add-contact-tag",
  description: "Add a tag to a contact (creates the tag if missing).",
  inputSchema: z.object({
    contactId: z.string().uuid(),
    tagName: z.string().min(1),
    color: z.string().optional().default("#3b82f6"),
  }),
  execute: async ({ contactId, tagName, color }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();

    const { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", contactId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!contact) throw new Error("Contact not found");

    let { data: tag } = await supabase
      .from("tags")
      .select("id, name, color")
      .eq("user_id", userId)
      .ilike("name", tagName)
      .maybeSingle();

    if (!tag) {
      const { data: created, error } = await supabase
        .from("tags")
        .insert({ user_id: userId, name: tagName, color: color ?? "#3b82f6" })
        .select("id, name, color")
        .single();
      if (error) throw new Error(error.message);
      tag = created;
    }

    const { error: linkErr } = await supabase.from("contact_tags").upsert(
      { contact_id: contactId, tag_id: tag.id },
      { onConflict: "contact_id,tag_id" },
    );
    if (linkErr) throw new Error(linkErr.message);
    return { ok: true, tag };
  },
});

export const addContactNoteTool = createTool({
  id: "add-contact-note",
  description: "Append an internal note on a contact record.",
  inputSchema: z.object({
    contactId: z.string().uuid(),
    noteText: z.string().min(1),
  }),
  execute: async ({ contactId, noteText }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", contactId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!contact) throw new Error("Contact not found");

    const { data, error } = await supabase
      .from("contact_notes")
      .insert({
        contact_id: contactId,
        user_id: userId,
        note_text: noteText,
      })
      .select("id, note_text, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { note: data };
  },
});

export const listTagsTool = createTool({
  id: "list-tags",
  description: "List all tags available in the CRM workspace.",
  inputSchema: z.object({}),
  execute: async (_input, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data, error } = await supabase
      .from("tags")
      .select("id, name, color")
      .eq("user_id", userId)
      .order("name");
    if (error) throw new Error(error.message);
    return { tags: data ?? [] };
  },
});

export const listBroadcastsTool = createTool({
  id: "list-broadcasts",
  description: "List recent WhatsApp broadcasts and delivery stats.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(20).optional().default(10),
  }),
  execute: async ({ limit }, context) => {
    const userId = requireUserId(context);
    const supabase = createCrmAdmin();
    const { data, error } = await supabase
      .from("broadcasts")
      .select(
        "id, name, template_name, status, total_recipients, sent_count, delivered_count, read_count, failed_count, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (error) throw new Error(error.message);
    return { broadcasts: data ?? [] };
  },
});

/** Shared tool bag for sector agents — tailor per agent in agent files. */
export const crmReadTools = {
  searchContactsTool,
  getContactTool,
  listConversationsTool,
  getConversationThreadTool,
  listPipelineDealsTool,
  listTagsTool,
  listBroadcastsTool,
};

export const crmWriteTools = {
  createDealTool,
  addContactTagTool,
  addContactNoteTool,
};
