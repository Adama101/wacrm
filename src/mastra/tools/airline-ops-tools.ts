import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  AIRLINE_KNOWLEDGE_TOPICS,
  getAirlineKnowledge,
  type AirlineKnowledgeTopic,
} from "../skills/airline/knowledge";
import { AIRLINE_PLAYBOOKS } from "../skills/airline/playbooks";

const severitySchema = z.enum(["S0", "S1", "S2", "S3", "S4"]);

/**
 * Retrieve structured airline ops knowledge (roles, IRROPS, CX, sustainability, RAM themes).
 */
export const getAirlineKnowledgeTool = createTool({
  id: "get-airline-knowledge",
  description:
    "Retrieve Meridian airline ops knowledge: roles, turn milestones, IRROPS severity, passenger priority, CX comms, people empowerment, sustainability, SLAs, or RAM Open Innovation theme mapping.",
  inputSchema: z.object({
    topic: z
      .enum([
        "overview",
        "ram-themes",
        "roles",
        "turn-milestones",
        "irrops-severity",
        "passenger-priority",
        "cx-comms",
        "people-empowerment",
        "sustainability",
        "slas",
      ])
      .describe("Knowledge topic to retrieve"),
  }),
  execute: async ({ topic }) => {
    const entry = getAirlineKnowledge(topic as AirlineKnowledgeTopic);
    return {
      topic,
      title: entry.title,
      body: entry.body,
      availableTopics: AIRLINE_KNOWLEDGE_TOPICS,
    };
  },
});

/**
 * Classify an IRROPS scenario into severity + action plan skeleton.
 */
export const classifyIrropsScenarioTool = createTool({
  id: "classify-irrops-scenario",
  description:
    "Classify a day-of-ops disruption into severity S0–S4 and return owners, passenger update cadence, and recommended playbooks. Does not invent flight times.",
  inputSchema: z.object({
    delayMinutes: z
      .number()
      .int()
      .min(0)
      .max(48 * 60)
      .optional()
      .describe("Known delay minutes if delay (not cancel)"),
    isCancellation: z.boolean().optional().default(false),
    isDiversion: z.boolean().optional().default(false),
    safetyOrSecurity: z.boolean().optional().default(false),
    overnightRisk: z.boolean().optional().default(false),
    connectionsAtRisk: z.boolean().optional().default(false),
    confirmedReason: z
      .string()
      .optional()
      .describe("Ops-confirmed reason only; leave empty if unknown"),
  }),
  execute: async (input) => {
    let severity: z.infer<typeof severitySchema> = "S0";
    if (input.safetyOrSecurity) severity = "S4";
    else if (input.isCancellation || input.isDiversion || input.overnightRisk)
      severity = "S3";
    else if ((input.delayMinutes ?? 0) >= 60) severity = "S2";
    else if ((input.delayMinutes ?? 0) >= 15 || input.connectionsAtRisk)
      severity = "S1";

    const updateMinutes =
      severity === "S0" ? 30 : severity === "S4" ? 0 : severity === "S3" ? 20 : 15;

    const playbookIds =
      severity === "S4"
        ? ["irrops"]
        : severity === "S3"
          ? ["irrops", "connection-protect", "sustainable-irrops", "cx-close-loop"]
          : severity === "S2"
            ? ["irrops", "connection-protect", "ssr-prm-care", "elite-recovery"]
            : severity === "S1"
              ? ["irrops", "connection-protect", "ssr-prm-care"]
              : ["preflight-ops", "station-manager"];

    return {
      severity,
      label: {
        S0: "Routine / monitor",
        S1: "Active delay — protect connections",
        S2: "Extended disruption — structured recovery",
        S3: "Cancel / diversion / overnight — manager-led",
        S4: "Safety/security — halt speculative passenger messaging",
      }[severity],
      passengerUpdateCadenceMinutes: updateMinutes,
      nextUpdateInstruction:
        severity === "S4"
          ? "Do not speculate. Wait for ops/security approved script."
          : `Set an explicit next update time (~${updateMinutes} min) in every passenger message.`,
      confirmedReason: input.confirmedReason?.trim() || null,
      reasonRule:
        "Only state reasons confirmed by ops. If unknown, say we are confirming with operations.",
      recommendedPlaybookIds: playbookIds,
      ownerFocus:
        severity === "S4" || severity === "S3"
          ? "Station-Lead + OCC liaison"
          : "Station-Lead with Ground/Gate owners on milestones",
      themes: ["operations", "cx", "people", "sustainability"],
    };
  },
});

/**
 * Build a turn milestone plan for ground/gate accountability.
 */
export const planAircraftTurnTool = createTool({
  id: "plan-aircraft-turn",
  description:
    "Build an aircraft turn milestone plan with owners and WhatsApp-ready staff tasks. Uses relative minutes from on-blocks — does not invent real STD/ETD.",
  inputSchema: z.object({
    turnStandardMinutes: z
      .number()
      .int()
      .min(25)
      .max(180)
      .default(55)
      .describe("Published turn standard in minutes"),
    hasSsrLoad: z.boolean().optional().default(true),
    notes: z.string().optional(),
  }),
  execute: async ({ turnStandardMinutes, hasSsrLoad, notes }) => {
    const t = turnStandardMinutes ?? 55;
    const milestones = [
      {
        id: "on-blocks",
        offsetMin: 0,
        title: "On-blocks / start clock",
        ownerTag: "Ground",
        staffPrompt: "CHECK-IN: on-blocks, turn clock started.",
      },
      {
        id: "cabin-reset",
        offsetMin: Math.round(t * 0.15),
        title: "Cabin reset + cleaning window open",
        ownerTag: "Ground",
        staffPrompt: "Own cabin reset; report BLOCKED if cleaning late.",
      },
      {
        id: "services-parallel",
        offsetMin: Math.round(t * 0.25),
        title: "Catering / water-waste / fuel parallel window",
        ownerTag: "Ground",
        staffPrompt: "Confirm catering+fuel windows; flag over-cater risk.",
      },
      {
        id: "boarding-ready",
        offsetMin: Math.round(t * 0.55),
        title: "Boarding-ready gate",
        ownerTag: "Gate",
        staffPrompt: hasSsrLoad
          ? "Stage SSR/PRM/wheelchairs before general boarding."
          : "Confirm gate ready for boarding.",
      },
      {
        id: "blocker-gate",
        offsetMin: Math.max(t - 10, Math.round(t * 0.7)),
        title: "Blocker escalation gate (T-10)",
        ownerTag: "Station-Lead",
        staffPrompt: "Any open BLOCKED must reach Station-Lead now.",
      },
      {
        id: "doors",
        offsetMin: t,
        title: "Doors-closed / ready for push target",
        ownerTag: "Gate",
        staffPrompt: "Report doors status with clock time.",
      },
    ];

    return {
      turnStandardMinutes: t,
      notes: notes ?? null,
      milestones,
      sustainabilityNudge:
        "After turn, note unused catering uplift for waste review — no invented CO2 figures.",
      playbookId: "aircraft-turn",
      assignHint:
        "Use assignAccountabilityTaskTool per milestone owner, then WhatsApp nudge.",
    };
  },
});

/**
 * Multi-wave passenger journey updates (CX).
 */
export const draftPassengerJourneyUpdatesTool = createTool({
  id: "draft-passenger-journey-updates",
  description:
    "Draft a multi-wave WhatsApp passenger journey update plan (acknowledge → status → decision → close-the-loop). Uses only confirmed facts you provide.",
  inputSchema: z.object({
    language: z
      .enum(["en", "fr", "ar", "auto"])
      .optional()
      .default("en")
      .describe("Passenger language preference"),
    severity: severitySchema.optional(),
    confirmedFacts: z
      .array(z.string())
      .min(1)
      .describe("Only ops-confirmed facts to include"),
    unknownItems: z
      .array(z.string())
      .optional()
      .describe("Items explicitly unknown — must not be invented"),
    optionsForPassenger: z
      .array(z.string())
      .optional()
      .describe("Policy-allowed choices to offer for autonomy"),
    nextUpdateMinutes: z.number().int().min(5).max(120).optional().default(20),
  }),
  execute: async ({
    language,
    severity,
    confirmedFacts,
    unknownItems,
    optionsForPassenger,
    nextUpdateMinutes,
  }) => {
    const langNote =
      language === "fr"
        ? "Write final WhatsApp copy in French."
        : language === "ar"
          ? "Write final WhatsApp copy in Arabic (Modern Standard, short)."
          : language === "auto"
            ? "Match the passenger's language from the thread."
            : "Write final WhatsApp copy in English.";

    const facts = confirmedFacts.map((f) => `• ${f}`).join("\n");
    const unknowns =
      unknownItems && unknownItems.length
        ? unknownItems.map((u) => `• ${u}`).join("\n")
        : "• (none listed)";

    const options =
      optionsForPassenger && optionsForPassenger.length
        ? optionsForPassenger.map((o, i) => `${i + 1}) ${o}`).join("\n")
        : "1) Wait for the next update\n2) Speak to an agent for rebooking options";

    return {
      severity: severity ?? null,
      languageInstruction: langNote,
      waves: [
        {
          id: "T0",
          purpose: "Acknowledge + empathy + next update time",
          skeleton: `We're sorry for the disruption.\nWhat we know:\n${facts}\nWe will update you again in about ${nextUpdateMinutes} minutes.`,
        },
        {
          id: "T1",
          purpose: "Status with no speculation",
          skeleton: `Update:\n${facts}\nStill confirming:\n${unknowns}\nNext update in about ${nextUpdateMinutes} minutes.`,
        },
        {
          id: "T2",
          purpose: "Decision / autonomy options",
          skeleton: `Here are your options:\n${options}\nReply with 1, 2, or 3 (or tell us what you need).`,
        },
        {
          id: "T3",
          purpose: "Close the loop",
          skeleton: `Following up after your journey disruption — is everything resolved on your side? Reply YES or tell us what is still open.`,
        },
      ],
      rules: [
        "Plain text for WhatsApp — no markdown.",
        "Never invent ETD, gate, compensation, or hotel confirmation.",
        "Keep under ~300 characters per wave when possible; split if needed.",
      ],
      playbookIds: ["irrops", "cx-close-loop"],
    };
  },
});

/**
 * Prioritize a passenger care queue.
 */
export const prioritizePassengerCareQueueTool = createTool({
  id: "prioritize-passenger-care-queue",
  description:
    "Score and sort a passenger care queue (SSR, UMNR, connections, elite, general) for IRROPS staffing.",
  inputSchema: z.object({
    passengers: z
      .array(
        z.object({
          ref: z.string().describe("Name, PNR, or contact id"),
          flags: z
            .array(
              z.enum([
                "medical",
                "security",
                "umnr",
                "prm",
                "ssr",
                "misconnect",
                "last_flight",
                "overnight",
                "elite",
                "group",
                "baggage",
                "general",
              ]),
            )
            .default(["general"]),
          note: z.string().optional(),
        }),
      )
      .min(1)
      .max(50),
  }),
  execute: async ({ passengers }) => {
    const weight: Record<string, number> = {
      medical: 100,
      security: 100,
      umnr: 90,
      prm: 85,
      ssr: 70,
      overnight: 65,
      last_flight: 60,
      misconnect: 55,
      elite: 40,
      group: 30,
      baggage: 25,
      general: 10,
    };

    const ranked = passengers
      .map((p) => {
        const score = p.flags.reduce((s, f) => s + (weight[f] ?? 0), 0);
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score);

    return {
      ranked,
      servingOrderHint:
        "Work top-down; assign Ground/Gate owners for SSR/PRM before general rebooking.",
      playbookIds: ["ssr-prm-care", "connection-protect", "elite-recovery"],
      knowledgeTopic: "passenger-priority" as const,
    };
  },
});

/**
 * Sustainability + productivity nudges for a scenario.
 */
export const buildSustainabilityOpsNudgeTool = createTool({
  id: "build-sustainability-ops-nudge",
  description:
    "Suggest practical sustainable airline ops actions for the current disruption or turn — no invented CO2 numbers.",
  inputSchema: z.object({
    scenario: z.enum([
      "delay",
      "cancel",
      "turn",
      "overnight_hotel",
      "catering_mismatch",
      "general",
    ]),
    sameDayRebookAvailable: z.boolean().optional(),
    paperVouchersInUse: z.boolean().optional(),
  }),
  execute: async ({
    scenario,
    sameDayRebookAvailable,
    paperVouchersInUse,
  }) => {
    const actions: string[] = [];
    if (scenario === "cancel" || scenario === "overnight_hotel") {
      actions.push(
        sameDayRebookAvailable
          ? "Prefer same-day rebooking over hotel when safe options exist."
          : "If overnight is required, bundle ground transport and use digital vouchers.",
      );
    }
    if (scenario === "delay" || scenario === "general") {
      actions.push(
        "Use WhatsApp multi-wave updates instead of paper gate handouts.",
      );
    }
    if (scenario === "turn" || scenario === "catering_mismatch") {
      actions.push(
        "Log unused catering uplift after load-factor drop for waste review.",
      );
    }
    if (paperVouchersInUse !== false) {
      actions.push(
        "Switch meal/hotel vouchers to digital delivery via WhatsApp when policy allows.",
      );
    }
    actions.push(
      "Keep accountability checklists in Meridian — avoid printed shift packets.",
    );

    return {
      scenario,
      actions,
      kpiIdeas: [
        "% passenger updates sent digitally",
        "% disruptions resolved with same-day rebook vs hotel",
        "Staff checklist completion before T-10",
        "Mean time to first passenger update after severity ≥ S1",
      ],
      caveat: "Do not claim fuel burn or CO2 savings without measured airline data.",
      playbookId: "sustainable-irrops",
      knowledgeTopic: "sustainability",
    };
  },
});

/**
 * List airline playbooks filtered by RAM theme.
 */
export const listAirlinePlaybooksByThemeTool = createTool({
  id: "list-airline-playbooks-by-theme",
  description:
    "List airline playbooks filtered by RAM Open Innovation theme: operations, cx, people, or sustainability.",
  inputSchema: z.object({
    theme: z
      .enum(["operations", "cx", "people", "sustainability", "all"])
      .default("all"),
  }),
  execute: async ({ theme }) => {
    const items = AIRLINE_PLAYBOOKS.filter(
      (p) => theme === "all" || p.themes.includes(theme),
    ).map((p) => ({
      id: p.id,
      title: p.title,
      persona: p.persona,
      themes: p.themes,
      stepCount: p.steps.length,
    }));
    return { theme, playbooks: items };
  },
});

export const airlineOpsTools = {
  getAirlineKnowledgeTool,
  classifyIrropsScenarioTool,
  planAircraftTurnTool,
  draftPassengerJourneyUpdatesTool,
  prioritizePassengerCareQueueTool,
  buildSustainabilityOpsNudgeTool,
  listAirlinePlaybooksByThemeTool,
};
