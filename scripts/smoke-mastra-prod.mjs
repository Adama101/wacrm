/**
 * Production smoke test for Meridian Mastra Server.
 * Usage: node scripts/smoke-mastra-prod.mjs
 * Optional: MASTRA_SERVER_URL=https://meridian-e537.server.mastra.cloud
 */

const BASE =
  process.env.MASTRA_SERVER_URL ??
  "https://meridian-e537.server.mastra.cloud";

const AGENT_IDS = [
  "business-concierge",
  "sales-agent",
  "support-agent",
  "marketing-agent",
  "operations-agent",
  "restaurant-ops-agent",
  "airline-ops-agent",
  "retail-ops-agent",
];

async function req(path, init) {
  const res = await fetch(`${BASE}${path}`, init);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* sse or plain */
  }
  return { res, text, json };
}

function pass(name, detail = "") {
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  console.error(`FAIL  ${name} — ${detail}`);
}

async function main() {
  let failures = 0;

  {
    const { res, json } = await req("/health");
    if (res.ok && json?.success) pass("GET /health");
    else {
      fail("GET /health", `${res.status} ${JSON.stringify(json)}`);
      failures++;
    }
  }

  {
    const { res, json } = await req("/api/agents");
    const ids = json && typeof json === "object" ? Object.keys(json) : [];
    const missing = AGENT_IDS.filter((id) => !ids.includes(id));
    if (res.ok && missing.length === 0) pass("GET /api/agents", `${ids.length} agents`);
    else {
      fail("GET /api/agents", missing.length ? `missing ${missing}` : String(res.status));
      failures++;
    }
  }

  {
    const { res, json } = await req("/api/tools/classifyIrropsScenarioTool/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          delayMinutes: 90,
          connectionsAtRisk: true,
          confirmedReason: "ATC hold",
        },
      }),
    });
    if (res.ok && json?.severity === "S2") pass("tool classifyIrropsScenarioTool", "S2");
    else {
      fail("tool classifyIrropsScenarioTool", `${res.status} ${JSON.stringify(json)?.slice(0, 200)}`);
      failures++;
    }
  }

  {
    const { res, json } = await req("/api/tools/getAirlineKnowledgeTool/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { topic: "ram-themes" } }),
    });
    if (res.ok && json?.title) pass("tool getAirlineKnowledgeTool");
    else {
      fail("tool getAirlineKnowledgeTool", String(res.status));
      failures++;
    }
  }

  {
    const { res, text } = await req("/api/mcp/meridian-mcp/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "smoke", version: "1" },
        },
      }),
    });
    if (res.ok && text.includes("Meridian MCP")) pass("MCP initialize");
    else {
      fail("MCP initialize", `${res.status}`);
      failures++;
    }
  }

  {
    const { res, json, text } = await req(
      "/api/agents/airline-ops-agent/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "In one short sentence: confirm you are the Airline Ops agent.",
            },
          ],
        }),
      },
    );
    const err = json?.error || text;
    if (res.ok && (json?.text || json?.response || text.length > 20)) {
      pass("POST airline-ops-agent/generate", "LLM ok");
    } else if (String(err).includes("OPENAI_API_KEY")) {
      fail(
        "POST airline-ops-agent/generate",
        "Missing OPENAI_API_KEY on Mastra Server — set with: npx mastra server env set OPENAI_API_KEY 'sk-...' && npx mastra server restart",
      );
      failures++;
    } else {
      fail("POST airline-ops-agent/generate", `${res.status} ${String(err).slice(0, 240)}`);
      failures++;
    }
  }

  console.log("");
  console.log(`Base: ${BASE}`);
  console.log(
    failures
      ? `${failures} failure(s). Production is not fully ready.`
      : "All checks passed. Production agents are ready.",
  );
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
