import { RequestContext } from "@mastra/core/request-context";
import { mastra } from "@/mastra";
import { assertModelConfigured } from "@/mastra/model";
import {
  getSector,
  type AgentPersona,
  type AgentSectorId,
} from "@/mastra/sectors";

const AGENT_IDS = [
  "business-concierge",
  "sales-agent",
  "support-agent",
  "marketing-agent",
  "operations-agent",
  "restaurant-ops-agent",
  "airline-ops-agent",
  "retail-ops-agent",
] as const;

type RegisteredAgentId = (typeof AGENT_IDS)[number];

function isRegisteredAgentId(id: string): id is RegisteredAgentId {
  return (AGENT_IDS as readonly string[]).includes(id);
}

export type AgentChannel = "web" | "whatsapp";

export async function runSectorAgent(options: {
  sectorId?: string | null;
  userId: string;
  message: string;
  persona?: AgentPersona | null;
  channel?: AgentChannel | null;
  contactId?: string | null;
  conversationId?: string | null;
  /** Extra system-facing context appended to the user message */
  contextBlock?: string;
}) {
  const configError = assertModelConfigured();
  if (configError) {
    return { ok: false as const, error: configError, status: 503 };
  }

  const sector = getSector(options.sectorId);
  if (!isRegisteredAgentId(sector.agentId)) {
    return {
      ok: false as const,
      error: `Agent ${sector.agentId} is not registered`,
      status: 500,
    };
  }

  const agent = mastra.getAgentById(sector.agentId);
  if (!agent) {
    return {
      ok: false as const,
      error: `Agent ${sector.agentId} is not registered`,
      status: 500,
    };
  }

  const persona: AgentPersona =
    options.persona === "staff" ? "staff" : "manager";
  const channel: AgentChannel =
    options.channel === "whatsapp" ? "whatsapp" : "web";

  const requestContext = new RequestContext();
  requestContext.set("userId", options.userId);
  requestContext.set("sectorId", sector.id as AgentSectorId);
  requestContext.set("persona", persona);
  requestContext.set("channel", channel);
  if (options.contactId) requestContext.set("contactId", options.contactId);
  if (options.conversationId) {
    requestContext.set("conversationId", options.conversationId);
  }

  const rolePreamble =
    channel === "whatsapp"
      ? persona === "staff"
        ? "Role mode: STAFF on WhatsApp. You are their ops partner in-chat — tell, execute, inform, and do the work via tools. Your final message is delivered on WhatsApp."
        : "Role mode: MANAGER on WhatsApp. Full ops companion in-chat (same powers as web). Execute tools; reply with a tight WhatsApp update."
      : persona === "staff"
        ? "Role mode: STAFF accountability partner (web). Keep answers checklist-oriented with clear DONE/BLOCKED expectations. Prefer routing staff to WhatsApp for day-of execution."
        : "Role mode: MANAGER operations companion (web admin). Prioritize situational awareness, staffing, SLAs, and coaching.";

  const prompt = [
    rolePreamble,
    options.message,
    options.contextBlock
      ? `---\nCRM context:\n${options.contextBlock}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const result = await agent.generate(prompt, { requestContext });
    return {
      ok: true as const,
      text: result.text ?? "",
      sector,
      persona,
      channel,
      toolCalls: result.toolCalls ?? [],
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Agent generation failed";
    return { ok: false as const, error: message, status: 500 };
  }
}
