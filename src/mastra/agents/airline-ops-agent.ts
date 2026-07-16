import { Agent } from "@mastra/core/agent";
import { getAgentModel } from "../model";
import {
  addContactNoteTool,
  addContactTagTool,
  getContactTool,
  getConversationThreadTool,
  listConversationsTool,
  listPipelineDealsTool,
  listTagsTool,
  searchContactsTool,
} from "../tools/crm-tools";
import { airlineOpsTools } from "../tools/airline-ops-tools";
import { opsSkillsTools } from "../tools/ops-skills";
import { AIRLINE_OPS_INSTRUCTIONS } from "./airline-ops-instructions";

export const airlineOpsAgent = new Agent({
  id: "airline-ops-agent",
  name: "Airline Ops Agent",
  description:
    "Airline operations master for station turns, IRROPS, passenger CX, crew/ground accountability, and sustainable day-of-ops — WhatsApp-first for RAM-style station transformation.",
  instructions: AIRLINE_OPS_INSTRUCTIONS,
  model: getAgentModel(),
  tools: {
    searchContactsTool,
    getContactTool,
    listConversationsTool,
    getConversationThreadTool,
    listPipelineDealsTool,
    listTagsTool,
    addContactTagTool,
    addContactNoteTool,
    ...opsSkillsTools,
    ...airlineOpsTools,
  },
});
