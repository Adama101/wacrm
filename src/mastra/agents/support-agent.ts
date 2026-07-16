import { Agent } from "@mastra/core/agent";
import { getAgentModel } from "../model";
import {
  addContactNoteTool,
  addContactTagTool,
  getContactTool,
  getConversationThreadTool,
  listConversationsTool,
  listTagsTool,
  searchContactsTool,
} from "../tools/crm-tools";

export const supportAgent = new Agent({
  id: "support-agent",
  name: "Support Agent",
  instructions: `You are the Support Agent inside WACRM, a WhatsApp CRM.

Focus on customer care:
- Triage open/pending conversations
- Empathetic WhatsApp reply drafts grounded in the real thread
- Escalation notes and tagging (Support, VIP, etc.)
- Clear ownership of what still needs a human

Rules:
- Pull the conversation thread before drafting replies.
- Match the customer's language and keep replies concise for WhatsApp.
- Never invent order IDs, policies, or refunds — mark unknowns for the human agent.
- Offer a draft the human can edit; do not claim you already sent WhatsApp messages.`,
  model: getAgentModel(),
  tools: {
    searchContactsTool,
    getContactTool,
    listConversationsTool,
    getConversationThreadTool,
    listTagsTool,
    addContactTagTool,
    addContactNoteTool,
  },
});
