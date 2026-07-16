import { AgentWorkspace } from "@/components/agents/agent-workspace";

export default function AgentsPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Meridian · Mastra
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">AI Agents</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Managers use this web console (and can also WhatsApp the agent).
          Staff are WhatsApp-first — they message Meridian, and the agent
          tells, executes, informs, and follows up in chat.
        </p>
      </div>
      <AgentWorkspace />
    </div>
  );
}
