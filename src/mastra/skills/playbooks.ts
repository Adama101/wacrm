import { AIRLINE_PLAYBOOKS } from "./airline/playbooks";

export type OpsVertical = "restaurant" | "airline" | "retail";

export type OpsPersona = "manager" | "staff";

type Playbook = {
  id: string;
  title: string;
  persona: OpsPersona | "both";
  steps: string[];
  escalation?: string[];
  themes?: string[];
};

const RESTAURANT: Playbook[] = [
  {
    id: "open-shift",
    title: "Restaurant open-shift readiness",
    persona: "both",
    steps: [
      "Confirm FOH/BOH stations staffed and late call-outs covered",
      "Walk prep list: protein thaw, sauces, garnish, allergens board updated",
      "Section reservations vs walk-ins; mark VIP / large party notes",
      "Check POS offline mode + printer + card terminal",
      "Brief team on 86'd items and service priorities",
    ],
  },
  {
    id: "service-recovery",
    title: "Guest complaint recovery",
    persona: "both",
    steps: [
      "Acknowledge within 2 minutes; own the issue without blame",
      "Offer concrete remedy (remake / course / comps within policy)",
      "Notify manager if food safety, allergen, or VIP at risk",
      "Log incident + guest contact note in CRM",
      "Follow up after meal / next day with short WhatsApp check-in",
    ],
    escalation: [
      "Allergen exposure or illness → manager + stop related plates",
      "Viral / media risk → manager only, do not argue on WhatsApp",
    ],
  },
  {
    id: "close-shift",
    title: "Close-shift accountability",
    persona: "staff",
    steps: [
      "Sidework checklist complete with photo/time if required",
      "Cash tip out / drawer variance reported",
      "86 board + prep notes for next shift",
      "Open guest tickets closed or handed to closing manager",
    ],
  },
  {
    id: "manager-pulse",
    title: "Manager mid-shift pulse",
    persona: "manager",
    steps: [
      "Scan unread guest WhatsApp + open tickets",
      "Check cover pace vs labor; pull/cut if needed",
      "Spot-check expo times and table turns",
      "Coach one specific win + one fix with staff",
    ],
  },
];

const AIRLINE: Playbook[] = AIRLINE_PLAYBOOKS;

const RETAIL: Playbook[] = [
  {
    id: "open-store",
    title: "Store open checklist",
    persona: "both",
    steps: [
      "Cash drawer / safe procedures complete",
      "Floor recovery + fitting rooms clear",
      "Priority planograms / promos set",
      "Omnichannel queue: BOPIS, ship-from-store, returns",
      "Staff coverage by zone (front, stock, fitting)",
    ],
  },
  {
    id: "customer-recovery",
    title: "Retail service recovery",
    persona: "both",
    steps: [
      "Listen, restate issue, confirm order/SKU",
      "Resolve within policy: exchange, refund, price match",
      "Offer pickup/delivery alternative when OOS",
      "Tag contact (Return, VIP, Complaint) and log note",
      "Manager escalate for fraud suspicion or brand risk",
    ],
  },
  {
    id: "associate-accountability",
    title: "Associate task accountability",
    persona: "staff",
    steps: [
      "Accept assigned tasks with ETA",
      "Update completion or blocker before deadline",
      "Keep fitting-room / queue times visible to manager",
      "End-of-shift: unfinished tasks + customer callbacks",
    ],
  },
  {
    id: "store-manager",
    title: "Store manager companion",
    persona: "manager",
    steps: [
      "Conversion drivers: queue length, staffing, promo execution",
      "Omnichannel SLA breaches in WhatsApp inbox",
      "Shrink / fitting-room risk walk",
      "Coach associates with one measurable goal for the shift",
    ],
  },
];

const BY_VERTICAL: Record<OpsVertical, Playbook[]> = {
  restaurant: RESTAURANT,
  airline: AIRLINE,
  retail: RETAIL,
};

export function listPlaybooks(
  vertical: OpsVertical,
  persona?: OpsPersona,
): Playbook[] {
  return BY_VERTICAL[vertical].filter(
    (p) => !persona || p.persona === "both" || p.persona === persona,
  );
}

export function getPlaybook(
  vertical: OpsVertical,
  playbookId: string,
): Playbook | undefined {
  return BY_VERTICAL[vertical].find((p) => p.id === playbookId);
}

/** Role / ops tags recommended for CRM hygiene per vertical. */
export const VERTICAL_TAG_SCHEME: Record<
  OpsVertical,
  { staff: string[]; customer: string[]; ops: string[] }
> = {
  restaurant: {
    staff: ["Staff", "FOH", "BOH", "Shift-Lead"],
    customer: ["Guest", "VIP", "Reservation"],
    ops: ["Incident", "86", "Allergy", "Accountability"],
  },
  airline: {
    staff: ["Staff", "Crew", "Ground", "Station-Lead", "Gate", "OCC-Liaison"],
    customer: [
      "Passenger",
      "Elite",
      "SSR",
      "PRM",
      "UMNR",
      "Connection",
      "Baggage",
    ],
    ops: [
      "IRROPS",
      "Incident",
      "Accountability",
      "Rebooking",
      "Turn",
      "Sustainability",
    ],
  },
  retail: {
    staff: ["Staff", "Associate", "Stock", "Shift-Lead"],
    customer: ["Shopper", "VIP", "BOPIS", "Return"],
    ops: ["Incident", "OOS", "Omnichannel", "Accountability"],
  },
};
