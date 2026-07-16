/**
 * Airline operations knowledge for Meridian's Airline Ops Agent.
 * Oriented to Royal Air Maroc Open Innovation themes:
 * Transforming Airline Operations, Elevating CX, Empowering People,
 * Building a More Sustainable Airline.
 * @see https://openinnovation.royalairmaroc.com/
 */

export type AirlineKnowledgeTopic =
  | "roles"
  | "turn-milestones"
  | "irrops-severity"
  | "passenger-priority"
  | "cx-comms"
  | "people-empowerment"
  | "sustainability"
  | "slas"
  | "ram-themes"
  | "overview";

export const AIRLINE_KNOWLEDGE: Record<
  AirlineKnowledgeTopic,
  { title: string; body: string }
> = {
  overview: {
    title: "Airline ops mastery overview",
    body: `Meridian Airline Ops is a WhatsApp-first command companion for station, ground, crew support, and passenger recovery.
It does not replace OCC, flight planning, or safety authority — it accelerates execution, accountability, and passenger communication on the day of ops.
Core loops: sense risk → assign owners → communicate with a next-update time → close the loop in CRM → coach people → cut waste.`,
  },
  "ram-themes": {
    title: "RAM Open Innovation theme mapping",
    body: `Map every recommendation to measurable airline value:
1) Transforming Airline Operations — faster turns, fewer IRROPS surprises, clear ownership of blockers, station pulse in minutes not hours.
2) Elevating Customer Experience (with airport partners) — proactive, time-bound passenger updates; SSR/UMNR/elite care; autonomy via clear options; close-the-loop after recovery.
3) Empowering People — WhatsApp-native checklists for ground/crew support roles; psychologically safe BLOCKED escalations; coach with one measurable win per shift.
4) Building a More Sustainable Airline — prefer digital vouchers/comms over paper; reduce unnecessary hotel/transport when rebooking recovers same-day; flag catering waste and empty deadhead risk in manager briefs; avoid speculative fuel-burn claims.`,
  },
  roles: {
    title: "Station & day-of-ops roles",
    body: `Typical Meridian tags / owners:
- Station-Lead / Manager: prioritization, hotel/meal authority, legality escalations, media risk.
- Ground: gate readiness, boarding flow, wheelchairs/SSR staging, turn checklist items.
- Crew: duty start, briefing acknowledgement, cabin readiness signals (never override captain/safety).
- OCC / Ops Control (external): cancellations, diversions, MEL/CDL commercial impact — escalate, do not invent.
- Airport partners (ONDA-style): infrastructure, security queues, gate changes — coordinate messaging, do not invent slot times.`,
  },
  "turn-milestones": {
    title: "Aircraft turn discipline (A-CDM style)",
    body: `Use time-boxed milestones (adjust to published turn standard for the fleet/station):
1) On-blocks / chocks — start clock; confirm gate services.
2) Passenger disembark + cabin reset start.
3) Catering / cleaning / water-waste / fuel windows in parallel with engineering walkaround.
4) Boarding ready — SSR/UMNR/wheelchairs staged before general boarding.
5) Last-minute bags / gate baggage coordination.
6) Doors closed / ready for push — escalate blockers ≥10 min before STD/ETD risk.
Never invent actual times; ask staff to report DONE/BLOCKED with clock time.`,
  },
  "irrops-severity": {
    title: "IRROPS severity ladder",
    body: `S0 Routine delay <15m — monitor, no mass passenger ping unless connections at risk.
S1 Delay 15–60m — publish reason + next update time; protect tight connections.
S2 Delay 60–180m or equipment change — structured recovery: rebooking queue, meal policy, SSR priority.
S3 Cancel / diversion / overnight — manager-led; hotel/transport approvals; stop speculative ETAs.
S4 Safety/security — halt commercial WhatsApp speculation; follow ops control / security script only.
Always pair severity with: owner, next update clock time, and passenger cohort priorities.`,
  },
  "passenger-priority": {
    title: "Passenger care priority queue",
    body: `When capacity is constrained, serve in this order unless policy says otherwise:
1) Safety / medical / security cases
2) UMNR / PRM / wheelchair / SSR requiring escort
3) Misconnects with last flights of day / overnight risk
4) Elite / high-value recovery commitments already promised
5) Groups / families that would fragment
6) General rebooking queue
Log each commitment with ETA on the passenger contact note.`,
  },
  "cx-comms": {
    title: "Passenger CX communication rules",
    body: `WhatsApp passenger style:
- Empathy first, then facts: what happened, what we know, what happens next, when we will update again.
- Never invent new ETD, gate, or compensation — use placeholders or ask for confirmed ops data.
- Give autonomy: 1–3 clear options (wait / rebook / hotel) when policy allows.
- Close the loop: after recovery, short check-in and tag resolution.
- Multilingual: match passenger language when known; keep sentences short.
Wave pattern: T0 acknowledge → T+15 status → decision wave → boarding/hotel wave → close-the-loop.`,
  },
  "people-empowerment": {
    title: "Empowering station people",
    body: `Staff WhatsApp contract:
- One checklist, one deadline, one owner.
- BLOCKED is success if early — celebrate early escalation.
- Managers coach with specific behavior ("stage wheelchairs before boarding call") not vague pressure.
- End of duty: open callbacks + incomplete milestones.
- Never shame; convert incidents into playbook improvements.`,
  },
  sustainability: {
    title: "Sustainable day-of-ops nudges",
    body: `Practical sustainability without greenwashing:
- Prefer digital meal/hotel vouchers and WhatsApp updates over paper printouts.
- Same-day rebooking over overnight hotel when safe and available.
- Flag catering over-order risk when load factor drops after cancel.
- Bundle passenger ground transport to cut empty vehicle runs.
- Encourage paperless shift checklists via Meridian accountability tools.
Do not claim fuel or CO2 numbers unless the user provides measured data.`,
  },
  slas: {
    title: "Default ops SLAs (override with airline policy)",
    body: `Defaults for Meridian coaching (replace with RAM policy when provided):
- Passenger delay update cadence: every 15–30 minutes during active IRROPS.
- SSR acknowledgement: within 5 minutes of request during station hours.
- Staff blocker escalation: immediately if it threatens STD/ETD or boarding.
- Manager station pulse: every 60–120 minutes on disrupted banks.
- Close-the-loop after hotel/rebooking: same calendar day.`,
  },
};

export const AIRLINE_KNOWLEDGE_TOPICS = Object.keys(
  AIRLINE_KNOWLEDGE,
) as AirlineKnowledgeTopic[];

export function getAirlineKnowledge(topic: AirlineKnowledgeTopic) {
  return AIRLINE_KNOWLEDGE[topic];
}
