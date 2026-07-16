export type AgentSectorId =
  | "concierge"
  | "sales"
  | "support"
  | "marketing"
  | "operations"
  | "restaurant"
  | "airline"
  | "retail";

export type AgentSectorGroup = "business" | "industry";

export type AgentPersona = "manager" | "staff";

export interface AgentSector {
  id: AgentSectorId;
  /** Mastra agent id registered in src/mastra/index.ts */
  agentId: string;
  name: string;
  shortLabel: string;
  description: string;
  group: AgentSectorGroup;
  /** Example prompts shown in the Agents workspace (manager default) */
  prompts: string[];
  /** Extra starters when Staff persona is selected */
  staffPrompts?: string[];
}

export const AGENT_SECTORS: AgentSector[] = [
  {
    id: "concierge",
    agentId: "business-concierge",
    name: "Business Concierge",
    shortLabel: "Concierge",
    group: "business",
    description:
      "Cross-functional coordinator across sales, support, marketing, CRM ops, and industry verticals.",
    prompts: [
      "Summarize my open pipeline and which deals need attention this week.",
      "Which conversations in the inbox look urgent?",
      "Which industry ops agent should I use for a dinner rush vs IRROPS day?",
    ],
  },
  {
    id: "sales",
    agentId: "sales-agent",
    name: "Sales Agent",
    shortLabel: "Sales",
    group: "business",
    description:
      "Pipeline coaching, deal next steps, qualification questions, and WhatsApp outreach drafts.",
    prompts: [
      "Which open deals are stuck and what should I say next?",
      "Qualify contact +15550102 and suggest a stage move.",
      "Draft a short WhatsApp follow-up for the Acme deal.",
    ],
  },
  {
    id: "support",
    agentId: "support-agent",
    name: "Support Agent",
    shortLabel: "Support",
    group: "business",
    description:
      "Customer care replies, ticket triage, tone-matched WhatsApp responses, and escalation notes.",
    prompts: [
      "Draft a calm reply for the shipping complaint conversation.",
      "List open support-tagged contacts and suggested next actions.",
      "Rewrite this reply to be more empathetic: …",
    ],
  },
  {
    id: "marketing",
    agentId: "marketing-agent",
    name: "Marketing Agent",
    shortLabel: "Marketing",
    group: "business",
    description:
      "Broadcast copy, template ideas, audience segments, and campaign follow-ups.",
    prompts: [
      "Suggest a WhatsApp template for a welcome offer.",
      "Who should receive a re-engagement broadcast?",
      "Write three short broadcast variants for VIP customers.",
    ],
  },
  {
    id: "operations",
    agentId: "operations-agent",
    name: "Operations Agent",
    shortLabel: "CRM Ops",
    group: "business",
    description:
      "CRM hygiene, tagging strategy, workload balance, and process recommendations.",
    prompts: [
      "Find contacts missing tags or company info.",
      "Propose a tagging scheme for VIP vs Lead vs Support.",
      "Summarize unread conversations and suggest assignment.",
    ],
  },
  {
    id: "restaurant",
    agentId: "restaurant-ops-agent",
    name: "Restaurant Ops",
    shortLabel: "Restaurant",
    group: "industry",
    description:
      "Manager companion for service + labor; staff accountability for FOH/BOH checklists and guest recovery.",
    prompts: [
      "Build my mid-shift restaurant ops brief.",
      "Assign prep accountability tasks to BOH staff due in 45 minutes.",
      "Guest is upset about a long wait — draft recovery and log an incident.",
    ],
    staffPrompts: [
      "Give me the open-shift FOH checklist and what I must confirm.",
      "Log DONE for sidework: polish cutlery + restock stations.",
      "I'm blocked on expo tickets — how do I escalate to the shift lead?",
    ],
  },
  {
    id: "airline",
    agentId: "airline-ops-agent",
    name: "Airline Ops",
    shortLabel: "Airline",
    group: "industry",
    description:
      "Full station command agent: turns, IRROPS severity, passenger CX waves, SSR/PRM care, staff accountability, and sustainable recovery — built for transforming airline operations.",
    prompts: [
      "Build a station manager brief for the next 4 hours and map risks to ops / CX / people / sustainability.",
      "AT425 is +90 minutes with connections at risk — classify IRROPS, prioritize the care queue, and draft FR/EN passenger update waves.",
      "Plan a 55-minute aircraft turn with WhatsApp tasks for Ground and Gate; escalate blockers at T-10.",
      "How would Meridian prove ROI in a 3–6 month POC for transforming airline operations?",
      "Which staff tasks are still open or blocked, and who should I coach first?",
    ],
    staffPrompts: [
      "Give me the aircraft-turn checklist for Ground and what I must report.",
      "Log CHECK-IN: gate area set, wheelchairs staged for PRM.",
      "Log BLOCKED: catering late — need Station-Lead decision before boarding.",
      "Show SSR/PRM care steps for boarding in 20 minutes.",
    ],
  },
  {
    id: "retail",
    agentId: "retail-ops-agent",
    name: "Retail Ops",
    shortLabel: "Retail",
    group: "industry",
    description:
      "Store manager companion for omnichannel SLAs; associate accountability for tasks, BOPIS, and recovery.",
    prompts: [
      "Build today's store manager ops brief.",
      "Assign associates to clear the BOPIS queue in 30 minutes.",
      "Customer WhatsApp about a failed pickup — draft a recovery reply.",
    ],
    staffPrompts: [
      "Give me the associate open-store checklist.",
      "Log DONE: fitting rooms recovered + size run for denim wall.",
      "How should I update my manager that ship-from-store is blocked on packing supplies?",
    ],
  },
];

export function getSector(id: string | null | undefined): AgentSector {
  return (
    AGENT_SECTORS.find((s) => s.id === id || s.agentId === id) ??
    AGENT_SECTORS[0]
  );
}

export function sectorsByGroup(group: AgentSectorGroup): AgentSector[] {
  return AGENT_SECTORS.filter((s) => s.group === group);
}
