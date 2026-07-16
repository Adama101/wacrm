"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Briefcase,
  Headphones,
  Loader2,
  Megaphone,
  Plane,
  Send,
  Sparkles,
  Store,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AGENT_SECTORS,
  sectorsByGroup,
  type AgentPersona,
  type AgentSector,
  type AgentSectorId,
} from "@/mastra/sectors";

const SECTOR_ICON: Record<AgentSectorId, typeof Bot> = {
  concierge: Sparkles,
  sales: Briefcase,
  support: Headphones,
  marketing: Megaphone,
  operations: Wrench,
  restaurant: UtensilsCrossed,
  airline: Plane,
  retail: Store,
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function AgentWorkspace() {
  const [sectorId, setSectorId] = useState<AgentSectorId>("restaurant");
  const [persona, setPersona] = useState<AgentPersona>("manager");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sector =
    AGENT_SECTORS.find((s) => s.id === sectorId) ?? AGENT_SECTORS[0];

  const starters = useMemo(() => {
    if (persona === "staff" && sector.staffPrompts?.length) {
      return sector.staffPrompts;
    }
    return sector.prompts;
  }, [persona, sector]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    setMessages([]);
  }, [sectorId, persona]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sectorId, persona }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Agent request failed");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.text?.trim() || "(empty response)",
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reach the agent";
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `I couldn't complete that request: ${message}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[520px] flex-col gap-4 lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto lg:w-80">
        <div>
          <h2 className="text-sm font-semibold text-white">Agents</h2>
          <p className="mt-1 text-xs text-slate-400">
            Industry ops companions + CRM specialists, powered by Mastra.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2">
          <p className="mb-2 px-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            Role mode
          </p>
          <div className="grid grid-cols-2 gap-1">
            {(
              [
                ["manager", "Manager companion"],
                ["staff", "Staff accountability"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPersona(id)}
                className={cn(
                  "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  persona === id
                    ? "bg-primary/15 text-primary"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <SectorGroup
          title="Industry operations"
          sectors={sectorsByGroup("industry")}
          activeId={sectorId}
          onSelect={setSectorId}
        />
        <SectorGroup
          title="Business CRM"
          sectors={sectorsByGroup("business")}
          activeId={sectorId}
          onSelect={setSectorId}
        />
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <header className="border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              {(() => {
                const Icon = SECTOR_ICON[sector.id];
                return <Icon className="h-4 w-4" />;
              })()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white">
                {sector.name}
              </h3>
              <p className="truncate text-xs text-slate-400">
                {persona === "manager"
                  ? "Operations companion for managers"
                  : "Accountability partner for staff"}
                {" · "}
                {sector.description}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                {persona === "manager"
                  ? "Ask for a brief, assignments, or guest/passenger/shopper recovery."
                  : "Ask for checklists, log DONE/BLOCKED, or get the exact WhatsApp reply to send."}
              </p>
              <div className="flex flex-col gap-2">
                {starters.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:border-primary/40 hover:bg-slate-800"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-slate-800 text-slate-100",
              )}
            >
              {m.text}
            </div>
          ))}

          {busy && (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3.5 py-2.5 text-sm text-slate-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running playbooks + CRM tools…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="border-t border-slate-800 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              placeholder={
                persona === "manager"
                  ? `Ask ${sector.shortLabel} for a brief or assignments…`
                  : `Ask ${sector.shortLabel} for a checklist or log an update…`
              }
              disabled={busy}
              className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary/50 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="sm"
              disabled={busy || !input.trim()}
              className="h-10 w-10 shrink-0 p-0"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SectorGroup({
  title,
  sectors,
  activeId,
  onSelect,
}: {
  title: string;
  sectors: AgentSector[];
  activeId: AgentSectorId;
  onSelect: (id: AgentSectorId) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 px-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {sectors.map((s) => (
          <SectorButton
            key={s.id}
            sector={s}
            active={s.id === activeId}
            onSelect={() => onSelect(s.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function SectorButton({
  sector,
  active,
  onSelect,
}: {
  sector: AgentSector;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = SECTOR_ICON[sector.id];
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
          active
            ? "border-primary/40 bg-primary/10"
            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900",
        )}
      >
        <Icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            active ? "text-primary" : "text-slate-400",
          )}
        />
        <span className="min-w-0">
          <span
            className={cn(
              "block text-sm font-medium",
              active ? "text-white" : "text-slate-200",
            )}
          >
            {sector.shortLabel}
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
            {sector.description}
          </span>
        </span>
      </button>
    </li>
  );
}
