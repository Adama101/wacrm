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

export async function runSectorAgent(options: {
  sectorId?: string | null;
  userId: string;
  message: string;
  persona?: AgentPersona | null;
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

  const requestContext = new RequestContext();
  requestContext.set("userId", options.userId);
  requestContext.set("sectorId", sector.id as AgentSectorId);
  requestContext.set("persona", persona);

  const rolePreamble =
    persona === "staff"
      ? "Role mode: STAFF accountability partner. Keep answers checklist-oriented with clear DONE/BLOCKED expectations."
      : "Role mode: MANAGER operations companion. Prioritize situational awareness, staffing, SLAs, and coaching.";

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
      toolCalls: result.toolCalls ?? [],
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Agent generation failed";
    return { ok: false as const, error: message, status: 500 };
  }
}
