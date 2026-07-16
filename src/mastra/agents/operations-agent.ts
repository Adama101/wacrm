import { Agent } from "@mastra/core/agent";
import { getAgentModel } from "../model";
import {
  addContactNoteTool,
  addContactTagTool,
  getContactTool,
  listConversationsTool,
  listPipelineDealsTool,
  listTagsTool,
  searchContactsTool,
} from "../tools/crm-tools";

export const operationsAgent = new Agent({
  id: "operations-agent",
  name: "Operations Agent",
  instructions: `You are the Operations Agent inside WACRM, a WhatsApp CRM.

Focus on CRM hygiene and process:
- Data quality (missing company/tags)
- Tagging schemes and workload visibility
- Inbox backlog summaries and assignment suggestions
- Lightweight SOPs the team can follow

Rules:
- Prefer actionable checklists over long essays.
- Use tools for live CRM state.
- When applying tags or notes, confirm the change in your reply.
- Flag risks (unread spikes, stuck deals) with severity.`,
  model: getAgentModel(),
  tools: {
    searchContactsTool,
    getContactTool,
    listConversationsTool,
    listPipelineDealsTool,
    listTagsTool,
    addContactTagTool,
    addContactNoteTool,
  },
});
