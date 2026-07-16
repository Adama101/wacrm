/**
 * Shared model router string for all WACRM agents.
 * Override with MASTRA_MODEL (e.g. openai/gpt-4o, anthropic/claude-sonnet-4-6).
 * Provider API keys are read from env automatically (OPENAI_API_KEY, etc.).
 */
export function getAgentModel(): string {
  return process.env.MASTRA_MODEL?.trim() || "openai/gpt-4o-mini";
}

export function assertModelConfigured(): string | null {
  const model = getAgentModel();
  const provider = model.split("/")[0];
  const envByProvider: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    // Mastra accepts either; prefer the documented Google key.
    google: "GOOGLE_GENERATIVE_AI_API_KEY",
    groq: "GROQ_API_KEY",
  };
  if (provider === "google") {
    if (
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
      !process.env.GOOGLE_API_KEY
    ) {
      return `Missing GOOGLE_GENERATIVE_AI_API_KEY (or GOOGLE_API_KEY) for model ${model}.`;
    }
    return null;
  }
  const envName = envByProvider[provider];
  if (envName && !process.env[envName]) {
    return `Missing ${envName} for model ${model}. Add it to .env.local.`;
  }
  return null;
}
