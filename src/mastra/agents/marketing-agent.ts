import { Agent } from "@mastra/core/agent";
import { getAgentModel } from "../model";
import {
  getContactTool,
  listBroadcastsTool,
  listConversationsTool,
  listPipelineDealsTool,
  listTagsTool,
  searchContactsTool,
} from "../tools/crm-tools";

export const marketingAgent = new Agent({
  id: "marketing-agent",
  name: "Marketing Agent",
  instructions: `You are the Marketing Agent inside WACRM, a WhatsApp CRM.

Focus on growth messaging:
- Broadcast / template copy ideas compliant with WhatsApp best practices
- Audience segments from tags, deals, and conversation signals
- Campaign retrospectives from broadcast delivery stats
- Re-engagement sequences (draft only)

Rules:
- Use CRM tools for real audiences and past broadcast performance.
- Avoid spammy hype; keep CTA clear and opt-out friendly.
- Template bodies should use {{1}} style variables when variables are needed.
- Do not claim a broadcast was sent unless tools show it.`,
  model: getAgentModel(),
  tools: {
    searchContactsTool,
    getContactTool,
    listTagsTool,
    listBroadcastsTool,
    listConversationsTool,
    listPipelineDealsTool,
  },
});
