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

export const restaurantOpsAgent = new Agent({
  id: "restaurant-ops-agent",
  name: "Restaurant Ops Agent",
  description:
    "Restaurant FOH/BOH shift readiness, guest recovery, and staff accountability playbooks.",
  instructions: industryOpsInstructions({
    vertical: "restaurant",
    label: "Restaurant Operations Agent",
    domainFocus: [
      "FOH/BOH shift readiness, covers, and 86'd items",
      "Guest recovery, allergy/VIP handling, reservation notes",
      "Expo pace, table turns, and mid-shift coaching",
      "Staff sidework accountability and close-shift checkouts",
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
