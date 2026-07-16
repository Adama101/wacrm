import { Mastra } from "@mastra/core";
import { airlineOpsAgent } from "./agents/airline-ops-agent";
import { businessConcierge } from "./agents/business-concierge";
import { marketingAgent } from "./agents/marketing-agent";
import { operationsAgent } from "./agents/operations-agent";
import { restaurantOpsAgent } from "./agents/restaurant-ops-agent";
import { retailOpsAgent } from "./agents/retail-ops-agent";
import { salesAgent } from "./agents/sales-agent";
import { supportAgent } from "./agents/support-agent";

/**
 * Mastra entrypoint for WACRM multi-sector agents.
 * @see https://mastra.ai/
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
