import { Mastra } from "@mastra/core";
import { airlineOpsAgent } from "./agents/airline-ops-agent";
import { businessConcierge } from "./agents/business-concierge";
import { marketingAgent } from "./agents/marketing-agent";
import { operationsAgent } from "./agents/operations-agent";
import { restaurantOpsAgent } from "./agents/restaurant-ops-agent";
import { retailOpsAgent } from "./agents/retail-ops-agent";
import { salesAgent } from "./agents/sales-agent";
import { supportAgent } from "./agents/support-agent";
import { meridianMcpServer } from "./mcp/meridian-mcp-server";

/**
 * Mastra entrypoint for Meridian multi-sector agents + MCP.
 * @see https://mastra.ai/
 * @see https://mastra.ai/guides/migrations/upgrade-to-v1/mcp
 */
export const mastra = new Mastra({
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
  mcpServers: {
    meridianMcpServer,
  },
});

export {
  AGENT_SECTORS,
  getSector,
  sectorsByGroup,
  type AgentPersona,
  type AgentSector,
  type AgentSectorGroup,
  type AgentSectorId,
} from "./sectors";
