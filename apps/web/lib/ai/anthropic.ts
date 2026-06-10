import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-sonnet-4-20250514";
export const AI_MAX_TOKENS = 1024;
export const AI_TIMEOUT_MS = 30_000;

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY no configurada");
    }
    client = new Anthropic({ apiKey, timeout: AI_TIMEOUT_MS });
  }
  return client;
}
