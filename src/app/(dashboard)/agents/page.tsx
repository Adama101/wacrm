import { AgentWorkspace } from "@/components/agents/agent-workspace";

export default function AgentsPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Powered by Mastra
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">AI Agents</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Multi-sector Mastra agents for CRM plus restaurant, airline, and
          retail operations — manager companions for live briefs, and staff
          accountability partners for checklists, task nudges, and DONE/BLOCKED
          check-ins.
        </p>
      </div>
      <AgentWorkspace />
    </div>
  );
}
