# Meridian

> WhatsApp command center for sales and frontline ops — shared inbox,
> pipelines, broadcasts, and AI agents for restaurants, airlines, retail,
> and revenue teams.

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e?logo=supabase)](https://supabase.com)
[![Mastra](https://img.shields.io/badge/AI-Mastra-0f766e)](https://mastra.ai)

**Meridian** is a B2B SaaS workspace built on the open WhatsApp CRM
template lineage (wacrm). Fork it, brand it further, or run it as your
own multi-tenant operations platform.

## Product

- **Shared inbox** on the official WhatsApp Business API
- **Contacts, tags, pipelines, broadcasts, automations, flows**
- **AI Agents** (Mastra) — restaurant, airline, retail + CRM agents
  - **Staff:** WhatsApp-first — agent tells, executes, informs in chat
  - **Managers:** admin webapp primary; same agents available on WhatsApp
- **Account management** — profile, WhatsApp config, themes

## Quick start

```bash
git clone https://github.com/Adama101/wacrm.git
cd wacrm
npm install
cp .env.local.example .env.local   # Supabase + Meta + OPENAI_API_KEY
npx supabase start                 # local stack (Docker / Colima)
node scripts/seed-demo.mjs         # demo workspace
npm run dev
```

Open <http://localhost:3000> for the marketing site, or
<http://localhost:3000/login> for the app.

Demo login after seeding: `demo@wacrm.local` / `demo123456`

## Pricing (product framing)

See `/pricing` in the app — Starter / Growth / Scale plans for GTM.
Billing provider wiring (Stripe) is the next integration step.

## Stack

- **App** — Next.js 16 (App Router), React 19, TypeScript, Tailwind v4
- **Data** — Supabase (Postgres + Auth + Storage + RLS)
- **WhatsApp** — Meta Cloud API
- **AI** — [Mastra](https://mastra.ai/) agents + tools

## License

[MIT](./LICENSE).
