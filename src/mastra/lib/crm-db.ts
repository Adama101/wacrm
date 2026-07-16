import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolExecutionContext } from "@mastra/core/tools";

export function createCrmAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL / service role key not configured");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function requireUserId(
  context: ToolExecutionContext | undefined,
): string {
  const userId = context?.requestContext?.get("userId");
  if (typeof userId !== "string" || !userId) {
    throw new Error("Missing authenticated userId in agent request context");
  }
  return userId;
}
