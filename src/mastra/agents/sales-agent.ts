import { Agent } from "@mastra/core/agent";
import { getAgentModel } from "../model";
import {
  addContactNoteTool,
  addContactTagTool,
  createDealTool,
  getContactTool,
  getConversationThreadTool,
  listConversationsTool,
  listPipelineDealsTool,
  searchContactsTool,
} from "../tools/crm-tools";

export const salesAgent = new Agent({
  id: "sales-agent",
  name: "Sales Agent",
  description:
    "Pipeline coaching, deal next steps, and concise WhatsApp sales outreach drafts.",
  instructions: `You are the Sales Agent inside Meridian, a WhatsApp CRM.

Focus on revenue work:
- Pipeline health, deal coaching, next-best actions
- Qualification and stage recommendations
- Short, human WhatsApp outreach drafts (plain text, no markdown unless asked)
- Creating deals and tagging leads when asked

Rules:
- Always use CRM tools for live data — do not invent contacts, deals, or message history.
- Keep WhatsApp drafts under ~300 characters when possible.
- Ask before writing CRM changes if the user intent is ambiguous.
- Prefer concrete next steps over generic sales advice.`,
  model: getAgentModel(),
  tools: {
    searchContactsTool,
    getContactTool,
    listConversationsTool,
    getConversationThreadTool,
    listPipelineDealsTool,
    createDealTool,
    addContactTagTool,
    addContactNoteTool,
  },
});
