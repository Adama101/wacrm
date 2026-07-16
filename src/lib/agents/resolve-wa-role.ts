import type { AgentPersona } from "@/mastra/sectors";
import type { AgentSectorId } from "@/mastra/sectors";

const MANAGER_TAGS = new Set([
  "manager",
  "shift-lead",
  "station-lead",
]);

const STAFF_TAGS = new Set([
  "staff",
  "foh",
  "boh",
  "crew",
  "ground",
  "associate",
  "stock",
]);

const SECTOR_HINTS: Array<{ tags: string[]; sector: AgentSectorId }> = [
  { tags: ["foh", "boh", "guest", "reservation", "86", "allergy"], sector: "restaurant" },
  {
    tags: ["crew", "ground", "passenger", "irrops", "rebooking", "ssr"],
    sector: "airline",
  },
  {
    tags: ["associate", "stock", "bopis", "shopper", "omnichannel", "oos"],
    sector: "retail",
  },
];

export type WaChannelRole = {
  /** Whether Meridian AI should auto-handle this WhatsApp contact */
  enabled: boolean;
  persona: AgentPersona;
  sectorId: AgentSectorId;
  tags: string[];
};

/**
 * Staff = WhatsApp-first agent users.
 * Managers = web-primary, but WhatsApp agent enabled when tagged Manager/Shift-Lead/etc.
 * Customers / guests = human inbox + flows/automations only.
 */
export function resolveWhatsAppAgentRole(tagNames: string[]): WaChannelRole {
  const tags = tagNames.map((t) => t.trim()).filter(Boolean);
  const lower = tags.map((t) => t.toLowerCase());

  const isManager = lower.some((t) => MANAGER_TAGS.has(t));
  const isStaff = lower.some((t) => STAFF_TAGS.has(t));

  if (!isManager && !isStaff) {
    return {
      enabled: false,
      persona: "staff",
      sectorId: "support",
      tags,
    };
  }

  let sectorId: AgentSectorId = isManager ? "concierge" : "operations";
  for (const hint of SECTOR_HINTS) {
    if (hint.tags.some((t) => lower.includes(t))) {
      sectorId = hint.sector;
      break;
    }
  }

  return {
    enabled: true,
    persona: isManager ? "manager" : "staff",
    sectorId,
    tags,
  };
}
