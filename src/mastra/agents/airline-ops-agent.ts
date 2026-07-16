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
import { opsSkillsTools } from "../tools/ops-skills";
import { industryOpsInstructions } from "./shared-ops-instructions";

export const airlineOpsAgent = new Agent({
  id: "airline-ops-agent",
  name: "Airline Ops Agent",
  instructions: industryOpsInstructions({
    vertical: "airline",
    label: "Airline Operations Agent",
    domainFocus: [
      "Station readiness, crew/ground coordination, turn discipline",
      "IRROPS passenger communications with time-bound updates",
      "Connections, SSR, elite care, and rebooking case notes",
      "Crew/ground accountability checklists and blocker escalations",
    ],
  }),
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
  },
});
