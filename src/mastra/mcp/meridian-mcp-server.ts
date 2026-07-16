import { MCPServer } from "@mastra/mcp";
import { airlineOpsAgent } from "../agents/airline-ops-agent";
import { businessConcierge } from "../agents/business-concierge";
import { marketingAgent } from "../agents/marketing-agent";
import { operationsAgent } from "../agents/operations-agent";
import { restaurantOpsAgent } from "../agents/restaurant-ops-agent";
import { retailOpsAgent } from "../agents/retail-ops-agent";
import { salesAgent } from "../agents/sales-agent";
import { supportAgent } from "../agents/support-agent";
import { airlineOpsTools } from "../tools/airline-ops-tools";
import { getOpsPlaybookTool } from "../tools/ops-skills";

/**
 * Exposes Meridian agents + playbook tools over MCP (v1 APIs).
 * @see https://mastra.ai/guides/migrations/upgrade-to-v1/mcp
 */
export const meridianMcpServer = new MCPServer({
  id: "meridian-mcp",
  name: "Meridian MCP",
  version: "1.0.0",
  description:
    "Meridian WhatsApp CRM agents, deep airline ops tools, and sector playbooks for restaurant, airline, and retail teams.",
  instructions: `Use ask_* tools to talk to specialist agents (prefer ask_airlineOpsAgent for station/IRROPS/CX).
Use get-ops-playbook and airline tools (classify-irrops, plan-aircraft-turn, passenger journey waves) without CRM auth.
CRM-mutating agent tools require an authenticated Meridian user context.`,
  tools: {
    getOpsPlaybookTool,
    ...airlineOpsTools,
  },
  agents: {
    businessConcierge,
    salesAgent,
    supportAgent,
    marketingAgent,
    operationsAgent,
    restaurantOpsAgent,
    airlineOpsAgent,
    retailOpsAgent,
  },
});
