import { toFetchResponse, toReqRes } from "fetch-to-node";
import { mastra } from "@/mastra";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Streamable HTTP MCP endpoint (serverless / App Router).
 * Uses MCPServer.startHTTP with serverless: true per Mastra v1 MCP guide.
 * @see https://mastra.ai/guides/migrations/upgrade-to-v1/mcp
 */
async function handleMcpRequest(request: Request) {
  const servers = mastra.listMCPServers();
  const mcpServer = servers?.meridianMcpServer ?? mastra.getMCPServerById("meridian-mcp");
  if (!mcpServer) {
    return Response.json({ error: "Meridian MCP server not registered" }, { status: 503 });
  }

  const token = process.env.MCP_SERVER_TOKEN;
  if (token) {
    const auth = request.headers.get("authorization");
    const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    const headerToken = request.headers.get("x-mcp-token");
    if (bearer !== token && headerToken !== token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { req: nodeReq, res: nodeRes } = toReqRes(request);

  await mcpServer.startHTTP({
    url: new URL(request.url),
    httpPath: "/api/mcp",
    req: nodeReq,
    res: nodeRes,
    options: {
      serverless: true,
    },
  });

  return toFetchResponse(nodeRes);
}

export const GET = handleMcpRequest;
export const POST = handleMcpRequest;
export const DELETE = handleMcpRequest;
