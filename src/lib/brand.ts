/**
 * Meridian — product brand constants.
 * Single source for marketing, auth chrome, and app shell.
 */
export const brand = {
  name: "Meridian",
  legalName: "Meridian Ops, Inc.",
  tagline: "WhatsApp-first ops for staff. Web command center for managers.",
  description:
    "Staff talk to Meridian AI on WhatsApp — it tells, executes, and informs. Managers run the admin webapp and can also command the same agents on WhatsApp.",
  domain: "meridian.ops",
  supportEmail: "hello@meridian.ops",
  twitter: "@meridianops",
  appUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    cadence: "month",
    description: "For small teams opening their first shared WhatsApp inbox.",
    cta: "Start free trial",
    highlighted: false,
    features: [
      "2 agent seats",
      "Shared inbox + contacts",
      "1 sales pipeline",
      "Basic automations",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    cadence: "month",
    description: "For operators who need broadcasts, richer CRM, and AI drafts.",
    cta: "Start free trial",
    highlighted: true,
    features: [
      "10 agent seats",
      "Pipelines + broadcasts",
      "Automations + Flows",
      "Inbox AI reply assist",
      "Business CRM agents",
      "Priority chat support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: 399,
    cadence: "month",
    description: "For multi-site ops with industry agents and accountability loops.",
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Unlimited seats*",
      "Restaurant, airline & retail AI ops",
      "Manager briefs + staff accountability",
      "SSO-ready workspace controls",
      "Dedicated onboarding",
      "SLA support",
    ],
  },
] as const;
