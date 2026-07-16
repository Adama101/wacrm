import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSectorAgent } from "@/lib/agents/run";
import { AGENT_SECTORS } from "@/mastra/sectors";

export async function GET() {
  return NextResponse.json({
    sectors: AGENT_SECTORS.map((s) => ({
      id: s.id,
      agentId: s.agentId,
      name: s.name,
      shortLabel: s.shortLabel,
      description: s.description,
      prompts: s.prompts,
    })),
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    message?: string;
    sectorId?: string;
    persona?: "manager" | "staff";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const result = await runSectorAgent({
    sectorId: body.sectorId,
    userId: user.id,
    message,
    persona: body.persona,
    channel: "web",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    text: result.text,
    persona: result.persona,
    sector: {
      id: result.sector.id,
      name: result.sector.name,
      agentId: result.sector.agentId,
    },
  });
}
