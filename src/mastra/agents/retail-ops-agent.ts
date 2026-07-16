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

export const retailOpsAgent = new Agent({
  id: "retail-ops-agent",
  name: "Retail Ops Agent",
  instructions: industryOpsInstructions({
    vertical: "retail",
    label: "Retail Operations Agent",
    domainFocus: [
      "Store open/close, zone coverage, and promo execution",
      "BOPIS / ship-from-store / returns omnichannel SLAs",
      "Floor recovery, fitting-room flow, and OOS alternatives",
      "Associate task accountability and manager coaching loops",
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
