"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Megaphone,
  MessageSquare,
  Plane,
  Radio,
  Store,
  UtensilsCrossed,
  Workflow,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const modules = [
  {
    icon: MessageSquare,
    title: "Shared inbox",
    body: "One WhatsApp number, many agents — assignment, notes, and status without the spreadsheet chaos.",
  },
  {
    icon: Workflow,
    title: "Pipelines & deals",
    body: "Kanban that stays tied to the conversation so revenue work never loses the thread.",
  },
  {
    icon: Radio,
    title: "Broadcasts",
    body: "Template-safe outreach with delivery tracking and per-recipient variables.",
  },
  {
    icon: Zap,
    title: "Automations",
    body: "Keyword, inbound, and schedule triggers — no code required for the 80% cases.",
  },
];

const agentSectors = [
  { icon: UtensilsCrossed, label: "Restaurant ops" },
  { icon: Plane, label: "Airline ops" },
  { icon: Store, label: "Retail ops" },
  { icon: Bot, label: "Sales & support" },
  { icon: Megaphone, label: "Marketing" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] h-[420px] w-[420px] rounded-full bg-sky-600/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <SiteHeader />

      <main className="relative">
        <Hero />
        <ProductSection />
        <AgentsSection />
        <CtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
      <div className="absolute inset-x-0 top-24 -z-10 mx-auto h-[55vh] max-w-6xl overflow-hidden rounded-none">
        <HeroStage />
      </div>

      <p className="animate-fade-up font-display text-5xl leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl">
        {brand.name}
      </p>
      <h1 className="animate-fade-up-delay mt-5 max-w-2xl text-xl font-medium text-slate-200 sm:text-2xl">
        {brand.tagline}
      </h1>
      <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-base text-slate-400">
        Staff live on WhatsApp with Meridian AI — it tells them what to do,
        executes, and follows up. Managers run the web command center, and can
        message the same agents on WhatsApp when they&apos;re on the floor.
      </p>
      <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 bg-teal-500 px-6 text-base text-slate-950 hover:bg-teal-400",
          )}
        >
          Start free trial
        </Link>
        <Link
          href="/pricing"
          className={cn(
            buttonVariants({ size: "lg", variant: "ghost" }),
            "h-12 px-6 text-base text-slate-200 hover:bg-white/5 hover:text-white",
          )}
        >
          See pricing
        </Link>
      </div>
    </section>
  );
}

function HeroStage() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07111f]/20 to-[#07111f]" />
      <div className="absolute inset-x-4 top-8 bottom-0 overflow-hidden rounded-t-2xl border border-white/10 bg-[#0b1628]/80 shadow-2xl shadow-teal-950/40 backdrop-blur-sm sm:inset-x-10">
        <div className="flex h-10 items-center gap-2 border-b border-white/10 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-xs text-slate-500">Inbox · Meridian</span>
        </div>
        <div className="grid h-[calc(100%-2.5rem)] grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr]">
          <div className="space-y-2 border-r border-white/10 p-3">
            {["Alice · VIP", "Omar · IRROPS", "Carol · BOPIS", "Maya · Staff"].map(
              (row, i) => (
                <div
                  key={row}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-[11px] sm:text-xs",
                    i === 1
                      ? "bg-teal-500/15 text-teal-100"
                      : "bg-white/5 text-slate-400",
                  )}
                >
                  {row}
                </div>
              ),
            )}
          </div>
          <div className="flex flex-col gap-2 p-4">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/10 px-3 py-2 text-xs text-slate-200">
              Flight delayed 90 min — can you rebook my connection?
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-teal-600/80 px-3 py-2 text-xs text-white">
              On it — holding a seat on the 19:40 and sending gate details.
            </div>
            <div className="mt-auto flex items-center gap-2 rounded-xl border border-dashed border-teal-400/30 bg-teal-500/5 px-3 py-2 text-[11px] text-teal-100/90">
              <Bot className="h-3.5 w-3.5" />
              Airline Ops drafted this · Manager approved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSection() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
        Platform
      </p>
      <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-white sm:text-5xl">
        Everything your WhatsApp team touches — in one composition.
      </h2>
      <p className="mt-4 max-w-xl text-slate-400">
        Meridian is built for operators, not slideware. Modules stay connected
        to the conversation so handoffs never drop.
      </p>
      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {modules.map((m) => (
          <div key={m.title} className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300">
              <m.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{m.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{m.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AgentsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="agents" className="border-y border-white/5 bg-[#050b14]/80 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
          AI Agents
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-white sm:text-5xl">
          Staff on WhatsApp. Managers on web — or WhatsApp.
        </h2>
        <p className="mt-4 max-w-xl text-slate-400">
          Tag contacts as Staff or Manager and the agent channel turns on.
          Restaurant, airline, and retail agents execute playbooks, assign
          tasks, log DONE/BLOCKED, and reply in-thread — no app switch for
          frontline teams.
        </p>
        <div
          ref={ref}
          className="mt-12 flex flex-wrap gap-3"
        >
          {agentSectors.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition-all duration-700",
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <s.icon className="h-4 w-4 text-teal-300" />
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-teal-400/20 bg-gradient-to-br from-teal-950/80 via-[#0b1628] to-[#07111f] px-6 py-14 sm:px-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        <h2 className="relative max-w-xl font-display text-3xl tracking-tight text-white sm:text-4xl">
          Put Meridian on your next shift.
        </h2>
        <p className="relative mt-3 max-w-lg text-slate-300">
          Spin up a workspace, connect WhatsApp Business, and invite your team.
          Trial includes Growth features for 14 days.
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 bg-teal-400 px-6 text-slate-950 hover:bg-teal-300",
            )}
          >
            Create workspace
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "h-12 text-white hover:bg-white/10",
            )}
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}
