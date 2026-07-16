export type AirlinePlaybook = {
  id: string;
  title: string;
  persona: "manager" | "staff" | "both";
  /** RAM Open Innovation theme tags */
  themes: Array<
    "operations" | "cx" | "people" | "sustainability"
  >;
  steps: string[];
  escalation?: string[];
};

/** Deep airline playbooks for station / IRROPS / CX / people / sustainability. */
export const AIRLINE_PLAYBOOKS: AirlinePlaybook[] = [
  {
    id: "preflight-ops",
    title: "Day-of-ops / station readiness",
    persona: "both",
    themes: ["operations", "people"],
    steps: [
      "Confirm crew check-in, standby coverage, and duty legality watchpoints",
      "Review IRROPS risk bank: weather, ATC, maintenance holds, curfew",
      "Verify aircraft/gate assignment and published turn standard",
      "Stage passenger templates (delay / gate change / cancel) with next-update placeholders",
      "Coordinate ground handlers, catering, fuel, cleaning windows in parallel",
      "Brief SSR/PRM/UMNR load and wheelchair equipment readiness",
    ],
  },
  {
    id: "aircraft-turn",
    title: "Aircraft turn execution",
    persona: "both",
    themes: ["operations", "sustainability"],
    steps: [
      "Start turn clock on-blocks; assign milestone owners on WhatsApp",
      "Parallelize cabin reset, catering, water/waste, fuel, and walkaround",
      "Protect boarding-ready gate: SSR staged before general boarding",
      "Escalate blockers ≥10 minutes before STD/ETD risk with owner + ETA",
      "Doors-closed readiness check; log incomplete items for next sector",
      "Note catering overage / unused uplift for sustainability follow-up",
    ],
    escalation: [
      "Engineering / MEL holding departure → Station-Lead + OCC, pause passenger speculation",
      "Missing crew legality → stop boarding push; ops control decision only",
    ],
  },
  {
    id: "irrops",
    title: "IRROPS passenger recovery",
    persona: "both",
    themes: ["operations", "cx"],
    steps: [
      "Classify severity (S0–S4) and set next passenger update clock time",
      "Publish clear reason using confirmed ops language only",
      "Prioritize medical/SSR/UMNR, misconnects, elite commitments, then general queue",
      "Offer rebooking / meal / hotel / transport per policy — never invent entitlements",
      "Log each case on passenger contact with commitment ETA",
      "Close the loop after recovery with short WhatsApp check-in + tags",
    ],
    escalation: [
      "Safety / security → stop commercial messaging; follow ops/security script",
      "Overnight misconnect → manager approval for hotel/transport",
      "Media / viral risk → Station-Lead only",
    ],
  },
  {
    id: "connection-protect",
    title: "Connection protection & misconnect recovery",
    persona: "both",
    themes: ["operations", "cx"],
    steps: [
      "Identify tight connections and last-flight-of-day risks early",
      "Coordinate gate hold / expedite only with authorized ops decision",
      "Pre-stage rebooking options before announcement when delay is firm",
      "Keep families/groups together when rebooking",
      "Provide clear wayfinding / transfer instructions in passenger language",
      "Tag Connection + outcome; schedule callback if still unresolved",
    ],
  },
  {
    id: "ssr-prm-care",
    title: "SSR / PRM / UMNR care",
    persona: "both",
    themes: ["cx", "people"],
    steps: [
      "Acknowledge SSR within station SLA; confirm equipment and escort",
      "Stage wheelchairs/assistance before boarding call",
      "UMNR: verify guardian handoff contacts and acceptance",
      "Keep dignity and privacy on WhatsApp — minimal sensitive detail",
      "Log assistance completed or blocker with owner",
    ],
    escalation: [
      "Medical deterioration → airport medical / emergency services, not WhatsApp advice",
    ],
  },
  {
    id: "elite-recovery",
    title: "Elite & high-value passenger recovery",
    persona: "manager",
    themes: ["cx"],
    steps: [
      "Identify elite / corporate / disrupted high-value passengers in inbox",
      "Assign a single owner and proactive update cadence",
      "Offer policy-compliant recognition (lounge, seat, voucher) without inventing policy",
      "Document commitment and close-the-loop satisfaction check",
    ],
  },
  {
    id: "crew-accountability",
    title: "Crew / ground staff accountability",
    persona: "staff",
    themes: ["people", "operations"],
    steps: [
      "Report duty start / position ready on time via CHECK-IN",
      "Complete assigned checklist items before departure window",
      "Escalate BLOCKED early (not after pushback risk)",
      "Close duty with open passenger callbacks + incomplete milestones",
    ],
  },
  {
    id: "station-manager",
    title: "Station manager companion brief",
    persona: "manager",
    themes: ["operations", "people"],
    steps: [
      "Inbox triage: IRROPS vs routine booking vs SSR",
      "Crew legality / turn bottlenecks in next 4 hours",
      "Outstanding passenger commitments past SLA",
      "Staff nudges for incomplete checklists",
      "Sustainability glance: digital vs paper, hotel vs same-day rebook opportunities",
    ],
  },
  {
    id: "gate-boarding",
    title: "Gate & boarding flow",
    persona: "staff",
    themes: ["operations", "cx"],
    steps: [
      "Confirm gate equipment, boarding passes scanners, and display consistency",
      "Pre-board SSR/PRM/families with clear announcements",
      "Manage zones without creating aisle congestion",
      "Coordinate gate-checked bags with final passenger count",
      "Report boarding complete / issues with clock time",
    ],
  },
  {
    id: "baggage-disruption",
    title: "Baggage disruption handling",
    persona: "both",
    themes: ["cx", "operations"],
    steps: [
      "Capture bag tag, itinerary, and delivery address accurately",
      "Set expectation with next update time — no false delivery promises",
      "Offer essentials kit / expense guidance per policy",
      "Tag contact Baggage + log file reference when known",
      "Close loop when bag delivered or claim path confirmed",
    ],
  },
  {
    id: "cx-close-loop",
    title: "Customer experience close-the-loop",
    persona: "both",
    themes: ["cx"],
    steps: [
      "After disruption recovery, send short satisfaction check on WhatsApp",
      "Capture complaint theme tag for product/ops learning",
      "Escalate unresolved NPS-risk cases to Station-Lead",
      "Never argue; document and improve the playbook",
    ],
  },
  {
    id: "sustainable-irrops",
    title: "Sustainable IRROPS choices",
    persona: "manager",
    themes: ["sustainability", "operations"],
    steps: [
      "Prefer same-day rebooking over overnight hotel when safe options exist",
      "Issue digital vouchers/comms; avoid paper where possible",
      "Bundle ground transport for stranded passengers",
      "Flag catering/load mismatches after cancellations for waste review",
      "Record decision rationale for later carbon/cost analytics (no invented CO2)",
    ],
  },
  {
    id: "people-coaching",
    title: "Shift coaching & empowerment",
    persona: "manager",
    themes: ["people"],
    steps: [
      "Start shift with one clarity message: priorities + owners",
      "Spot-check one milestone and coach specifically",
      "Thank early BLOCKED escalations publicly on the staff thread",
      "End bank with 3 wins + 1 process fix for tomorrow",
    ],
  },
];
